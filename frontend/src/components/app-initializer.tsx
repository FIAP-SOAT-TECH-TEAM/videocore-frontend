"use client";

import { useEffect } from "react";
import { useReportWebSocket } from "@/hooks/use-report-websocket";
import { useAuthStore } from "@/stores";

interface AppInitializerProps {
	children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
	const setHydrated = useAuthStore((state) => state.setHydrated);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const refreshSession = useAuthStore((state) => state.refreshSession);

	// Inicializar WebSocket para atualizações em tempo real
	useReportWebSocket();

	useEffect(() => {
		// Garante que a hidratação seja marcada como completa
		// O persist middleware do Zustand já chama setHydrated(true) no callback
		// Este é um fallback para garantir
		const timer = setTimeout(() => {
			setHydrated(true);
		}, 100);

		return () => clearTimeout(timer);
	}, [setHydrated]);

	// Validar sessão Cognito ao carregar app (se localStorage diz autenticado)
	useEffect(() => {
		if (isAuthenticated) {
			refreshSession();
		}
	}, [isAuthenticated, refreshSession]);

	return <>{children}</>;
}
