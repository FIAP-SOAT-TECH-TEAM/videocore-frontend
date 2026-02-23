"use client";

import type { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { connectWebSocket, disconnectWebSocket } from "@/lib/websocket";
import { useAuthStore } from "@/stores";
import { useReportsStore } from "@/stores/reports.store";

export function useReportWebSocket() {
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const updateReportFromWebSocket = useReportsStore((state) => state.updateReportFromWebSocket);
	const clientRef = useRef<Client | null>(null);

	useEffect(() => {
		if (!(isAuthenticated && user?.id)) {
			disconnectWebSocket();
			clientRef.current = null;
			return;
		}

		const client = connectWebSocket(user.id, user.id, {
			onReportUpdate: (payload) => {
				updateReportFromWebSocket(payload);

				if (payload.status === "COMPLETED") {
					toast.success(`Processamento concluído: ${payload.videoName}`, {
						description: "As imagens estão prontas para download.",
					});
				} else if (payload.status === "FAILED") {
					toast.error(`Processamento falhou: ${payload.videoName}`, {
						description: "Ocorreu um erro durante o processamento.",
					});
				} else if (payload.status === "STARTED") {
					toast.info(`Processamento iniciado: ${payload.videoName}`, {
						description: "O vídeo começou a ser processado.",
					});
				}
			},
			onConnect: () => {
				// [useReportWebSocket] Conectado e inscrito no tópico
			},
			onError: (_error) => {
				// [useReportWebSocket] Erro
			},
		});

		clientRef.current = client;

		return () => {
			disconnectWebSocket();
			clientRef.current = null;
		};
	}, [isAuthenticated, user?.id, updateReportFromWebSocket]);
}
