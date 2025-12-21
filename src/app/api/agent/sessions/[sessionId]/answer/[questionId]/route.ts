import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    COOKIE_OPTIONS,
    BACKEND_URL,
    createAuthHeaders,
    loggedFetch,
    logError,
} from "@/shared/api/bff-utils";

const ROUTE_NAME = "agent/sessions/answer";

/**
 * Попытка обновить access token
 */
async function tryRefreshToken(
    refreshToken: string
): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

interface RouteParams {
    params: Promise<{ sessionId: string; questionId: string }>;
}

/**
 * BFF API Route: Submit Answer to Agent Question
 * POST /api/agent/sessions/{sessionId}/answer/{questionId}
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { sessionId, questionId } = await params;
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
        const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

        if (!accessToken && !refreshToken) {
            return NextResponse.json(
                { message: "Не авторизован", detail: "No tokens found" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const url = `${BACKEND_URL}/agent/sessions/${sessionId}/answer/${questionId}`;

        let { response, data } = await loggedFetch(
            url,
            {
                route: ROUTE_NAME,
                method: "POST",
                headers: createAuthHeaders(accessToken),
                body: JSON.stringify(body),
            },
            body
        );

        if (response.status === 401 && refreshToken) {
            const tokens = await tryRefreshToken(refreshToken);
            if (tokens) {
                cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
                    ...COOKIE_OPTIONS,
                    maxAge: 60 * 15,
                });
                cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
                    ...COOKIE_OPTIONS,
                    maxAge: 60 * 60 * 24 * 7,
                });
                const retryResult = await loggedFetch(
                    url,
                    {
                        route: ROUTE_NAME,
                        method: "POST",
                        headers: createAuthHeaders(tokens.access_token),
                        body: JSON.stringify(body),
                    },
                    body
                );
                response = retryResult.response;
                data = retryResult.data;
            }
        }

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        logError(ROUTE_NAME, error);
        return NextResponse.json(
            {
                message: "Ошибка при отправке ответа",
                detail: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
