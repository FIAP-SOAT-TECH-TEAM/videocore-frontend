"use client";

import type { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { connectStomp } from "@/lib/websocket";
import { useAuthStore } from "@/stores";
import { useReportsStore } from "@/stores/reports.store";
import type { ReportPayload } from "@/types";

export function useReportWebSocket() {
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const updateReportFromWebSocket = useReportsStore((state) => state.updateReportFromWebSocket);
	const clientRef = useRef<Client | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function setup() {
			if (!(isAuthenticated && user?.id)) {
				clientRef.current?.deactivate();
				clientRef.current = null;

				return;
			}

			if (clientRef.current) return;

			const client = await connectStomp<ReportPayload>(`/topic`, {
				onPublish: (payload) => {
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
			});

			if (!cancelled) {
				clientRef.current = client;
			} else {
				client.deactivate();
			}
		}

		setup();

		return () => {
			cancelled = true;
			clientRef.current?.deactivate();
			clientRef.current = null;
		};
	}, [isAuthenticated, user?.id, updateReportFromWebSocket]);
}
