"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function AuthListener() {
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleLogout = () => {
            // Clear all queries from cache
            queryClient.clear();
            // Redirect to login
            router.push("/login");
        };

        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, [router, queryClient]);

    return null;
}
