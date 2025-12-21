"use client";

/**
 * WebSocket hook for Agent Session
 * Sends ping to receive session info with dialogue
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { WsSessionResponse, DialogueItem, WsResult, SessionStatus } from "@/shared/lib/schemas";

// WebSocket URL configuration
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

// Ping interval in ms
const PING_INTERVAL = 3000;

// Reconnect delay in ms
const RECONNECT_DELAY = 5000;

interface UseAgentSessionOptions {
    enabled?: boolean;
    onMessage?: (message: WsSessionResponse) => void;
    onError?: (error: string) => void;
    onStatusChange?: (status: SessionStatus) => void;
    onDialogueUpdate?: (dialogue: DialogueItem[]) => void;
    onResult?: (result: WsResult) => void;
}

export function useAgentSession(
    sessionId: number | null,
    options: UseAgentSessionOptions = {}
) {
    const {
        enabled = true,
    } = options;

    // Store callbacks in refs to avoid dependency issues
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const queryClient = useQueryClient();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<WsSessionResponse | null>(null);
    const [dialogue, setDialogue] = useState<DialogueItem[]>([]);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
    const [currentIteration, setCurrentIteration] = useState<number>(0);
    const [result, setResult] = useState<WsResult>(null);

    // Use ref for session status to avoid reconnect dependency issues
    const sessionStatusRef = useRef<SessionStatus | null>(null);
    sessionStatusRef.current = sessionStatus;

    // Send ping message
    const sendPing = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send("ping");
            console.log("[WS] Sent ping");
        }
    }, []);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.onopen = null;
            wsRef.current.onmessage = null;
            wsRef.current.onerror = null;
            wsRef.current.onclose = null;
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = false;
    }, []);

    const sendMessage = useCallback((data: unknown) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
        } else {
            console.warn("[WS] Cannot send message, not connected");
        }
    }, []);

    // Main connection effect
    useEffect(() => {
        if (!enabled || !sessionId) {
            cleanup();
            setIsConnected(false);
            return;
        }

        // Prevent duplicate connections
        if (isConnectingRef.current) {
            return;
        }

        const connect = () => {
            if (isConnectingRef.current) return;
            isConnectingRef.current = true;

            cleanup();

            try {
                const wsUrl = `${WS_URL}/sessions/${sessionId}`;
                console.log(`[WS] Connecting to ${wsUrl}`);
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    isConnectingRef.current = false;
                    setIsConnected(true);
                    setError(null);
                    console.log(`[WS] Connected to session ${sessionId}`);

                    // Send initial ping to get session info
                    setTimeout(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send("ping");
                            console.log("[WS] Sent initial ping");
                        }
                    }, 100);

                    // Set up periodic ping
                    pingIntervalRef.current = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send("ping");
                            console.log("[WS] Sent periodic ping");
                        }
                    }, PING_INTERVAL);
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data) as WsSessionResponse;
                        console.log("[WS] Received:", data);

                        setLastMessage(data);
                        optionsRef.current.onMessage?.(data);

                        // Update dialogue
                        if (data.dialogue) {
                            setDialogue(data.dialogue);
                            optionsRef.current.onDialogueUpdate?.(data.dialogue);
                        }

                        // Update session status
                        if (data.session_status) {
                            setSessionStatus(data.session_status);
                            sessionStatusRef.current = data.session_status;
                            optionsRef.current.onStatusChange?.(data.session_status);
                        }

                        // Update iteration
                        if (data.current_iteration !== undefined) {
                            setCurrentIteration(data.current_iteration);
                        }

                        // Handle result when session is done
                        if (data.result) {
                            setResult(data.result);
                            optionsRef.current.onResult?.(data.result);
                        }

                        // Invalidate session query to keep UI in sync
                        queryClient.invalidateQueries({
                            queryKey: ["agent-session", sessionId],
                        });

                    } catch (e) {
                        console.error("[WS] Failed to parse message:", e);
                    }
                };

                ws.onerror = (event) => {
                    console.error("[WS] Error:", event);
                    setError("Connection error");
                    optionsRef.current.onError?.("Connection error");
                };

                ws.onclose = (event) => {
                    isConnectingRef.current = false;
                    setIsConnected(false);
                    console.log(`[WS] Disconnected from session ${sessionId}, code: ${event.code}`);

                    // Clear ping interval
                    if (pingIntervalRef.current) {
                        clearInterval(pingIntervalRef.current);
                        pingIntervalRef.current = null;
                    }

                    // Reconnect if session not complete
                    const status = sessionStatusRef.current;
                    const shouldReconnect = status !== "done" && status !== "cancelled" && status !== "error";

                    if (shouldReconnect && enabled) {
                        console.log(`[WS] Will reconnect in ${RECONNECT_DELAY}ms`);
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, RECONNECT_DELAY);
                    }
                };

                wsRef.current = ws;
            } catch (e) {
                console.error("[WS] Failed to connect:", e);
                setError("Failed to connect");
                isConnectingRef.current = false;
            }
        };

        connect();

        return () => {
            cleanup();
            setIsConnected(false);
        };
    }, [enabled, sessionId, queryClient, cleanup]);

    // Manual reconnect function
    const reconnect = useCallback(() => {
        cleanup();
        // Trigger reconnect by re-running the effect
        setIsConnected(false);
        setError(null);
    }, [cleanup]);

    return {
        isConnected,
        error,
        lastMessage,
        dialogue,
        sessionStatus,
        currentIteration,
        result,
        sendMessage,
        sendPing,
        reconnect,
    };
}
