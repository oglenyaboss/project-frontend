import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    COOKIE_OPTIONS,
    BACKEND_URL,
    logRequest,
    logResponse,
    logError,
} from "@/shared/api/bff-utils";

const ROUTE_NAME = "requirements/export";

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
    params: Promise<{ requirementsId: string }>;
}

/**
 * BFF API Route: Export Requirements
 * GET /api/requirements/{requirementsId}/export?file=docx|pdf
 * 
 * Returns the file as a binary stream for download
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { requirementsId } = await params;
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
        const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

        if (!accessToken && !refreshToken) {
            return NextResponse.json(
                { message: "Не авторизован", detail: "No tokens found" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const fileFormat = searchParams.get("file") || "docx";

        const url = `${BACKEND_URL}/requirements/${requirementsId}/export?file=${fileFormat}`;
        const startTime = Date.now();

        logRequest("GET", url, { route: ROUTE_NAME });

        const headers: HeadersInit = {};
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        let response = await fetch(url, { headers });

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
                headers["Authorization"] = `Bearer ${tokens.access_token}`;
                response = await fetch(url, { headers });
            }
        }

        const durationMs = Date.now() - startTime;
        logResponse("GET", url, response.status, durationMs, { route: ROUTE_NAME }, "[Binary file response]");

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        // Get the file content
        const fileBuffer = await response.arrayBuffer();

        // Get content type and filename from response headers
        const contentType = response.headers.get("content-type") ||
            (fileFormat === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        const contentDisposition = response.headers.get("content-disposition") ||
            `attachment; filename="requirements.${fileFormat}"`;

        // Return the file as a stream
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": contentDisposition,
                "Content-Length": fileBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        logError(ROUTE_NAME, error);
        return NextResponse.json(
            {
                message: "Ошибка при экспорте требований",
                detail: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
