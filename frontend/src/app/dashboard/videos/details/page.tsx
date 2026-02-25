"use client";

import {
	AlertCircleIcon,
	ArrowLeft01Icon,
	Calendar01Icon,
	CheckmarkCircle01Icon,
	Download01Icon,
	InformationCircleIcon,
	Loading01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchVideoImagesDownloadUrl } from "@/lib/api";
import { useReportsStore } from "@/stores";
import { useSearchParams } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ProcessStatus } from "@/types";

const statusConfig: Record<
	ProcessStatus,
	{ label: string; icon: typeof CheckmarkCircle01Icon; color: string }
> = {
	COMPLETED: { label: "Concluído", icon: CheckmarkCircle01Icon, color: "text-green-600" },
	PROCESSING: { label: "Processando", icon: Loading01Icon, color: "text-blue-600" },
	STARTED: { label: "Iniciado", icon: Loading01Icon, color: "text-yellow-600" },
	FAILED: { label: "Falhou", icon: AlertCircleIcon, color: "text-red-600" },
};

export default function VideoDetailsPage() {
	const searchParams = useSearchParams();
	const id = `${searchParams.get("id")}`;

	const reports = useReportsStore((state) => state.reports);
	const fetchReportById = useReportsStore((state) => state.fetchReportById);
	const isLoading = useReportsStore((state) => state.isLoading);
	const [isDownloading, setIsDownloading] = React.useState(false);

	// Buscar reports se não carregados
	React.useEffect(() => {
		if (reports.length === 0) {
			fetchReportById(id);
		}
	}, [reports.length, fetchReportById]);

	const report = reports.find((r) => r.id === id);

	if (isLoading && reports.length === 0) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-6 lg:grid-cols-3">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-muted-foreground" />
				<h2 className="font-semibold text-lg">Processamento não encontrado</h2>
				<p className="text-muted-foreground">Nenhum report encontrado com o ID informado.</p>
				<Link href={"/dashboard/videos" as never}>
					<Button variant="outline">Voltar para lista</Button>
				</Link>
			</div>
		);
	}

	const statusInfo = statusConfig[report.status];

	const handleDownloadZip = async () => {
		setIsDownloading(true);
		try {
			const response = await fetchVideoImagesDownloadUrl(report.requestId, report.videoName);

			// Abrir a SAS URL para download
			window.open(response.url, "_blank");
			toast.success("Download iniciado!", {
				description: "O arquivo ZIP será baixado em breve.",
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro desconhecido";
			toast.error("Erro ao obter link de download", { description: message });
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Link href={"/dashboard/videos" as never} legacyBehavior={true} passHref={true}>
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="font-bold text-2xl tracking-tight">{report.videoName}</h1>
						<div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
							<span className="flex items-center gap-1">
								<HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
								{new Date(report.reportTime).toLocaleDateString("pt-BR")}
							</span>
						</div>
					</div>
				</div>

				{report.status === "COMPLETED" && (
					<Button onClick={handleDownloadZip} disabled={isDownloading}>
						{isDownloading ? (
							<>
								<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Obtendo link...
							</>
						) : (
							<>
								<HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
								Baixar ZIP de Imagens
							</>
						)}
					</Button>
				)}
			</div>

			{/* Status and Progress */}
			<div className="grid gap-6 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-sm">Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={statusInfo.icon} className={`h-5 w-5 ${statusInfo.color}`} />
							<span className="font-semibold">{statusInfo.label}</span>
						</div>
						{(report.status === "PROCESSING" || report.status === "STARTED") && (
							<div className="mt-3">
								<Progress value={report.percentStatusProcess} className="h-2" />
								<p className="mt-1 text-muted-foreground text-sm">
									{report.percentStatusProcess}% concluído
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-sm">Progresso</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-2xl">{report.percentStatusProcess}%</span>
							<span className="text-muted-foreground">concluído</span>
						</div>
						<Progress value={report.percentStatusProcess} className="mt-2 h-2" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="font-medium text-sm">Configuração</CardTitle>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger render={
										<button className="flex items-center justify-center rounded-full hover:bg-accent p-1 transition-colors">
										<HugeiconsIcon 
											icon={InformationCircleIcon} 
											className="h-5 w-5 text-muted-foreground"
										/>
										</button>
									}>
										
									</TooltipTrigger>
									<TooltipContent>
										<p>Utilize essas informações ao contatar nosso suporte</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>	
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							Intervalo de captura:{" "}
							<span className="font-medium text-foreground">{report.frameCutMinutes} min</span>
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Request ID:{" "}
							<span className="font-medium font-mono text-foreground text-xs">
								{report.requestId}
							</span>
						</p>
						{report.traceId && (
							<p className="mt-1 text-muted-foreground text-sm">
								Trace ID:{" "}
								<span className="font-medium font-mono text-foreground text-xs">
									{report.traceId}
								</span>
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Download Section */}
			<Card>
				<CardHeader>
					<CardTitle>Imagens Capturadas</CardTitle>
				</CardHeader>
				<CardContent>
					{report.status === "COMPLETED" ? (
						<div className="flex flex-col items-center justify-center gap-4 py-8">
							<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-12 w-12 text-green-600" />
							<p className="font-medium">Processamento concluído!</p>
							<p className="text-center text-muted-foreground text-sm">
								As imagens capturadas estão disponíveis para download como um arquivo ZIP. Clique no
								botão abaixo para baixar.
							</p>
							<Button onClick={handleDownloadZip} disabled={isDownloading} size="lg">
								{isDownloading ? (
									<>
										<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
										Obtendo link...
									</>
								) : (
									<>
										<HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
										Baixar ZIP de Imagens
									</>
								)}
							</Button>
						</div>
					) : report.status === "FAILED" ? (
						<div className="flex flex-col items-center justify-center gap-4 py-8">
							<HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-red-600" />
							<p className="font-medium">Processamento falhou</p>
							<p className="text-center text-muted-foreground text-sm">
								Ocorreu um erro durante o processamento deste vídeo. Tente fazer upload novamente.
							</p>
							<Link href={"/dashboard/upload" as never}>
								<Button variant="outline">Novo Upload</Button>
							</Link>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center gap-4 py-8">
							<HugeiconsIcon
								icon={Loading01Icon}
								className="h-12 w-12 animate-spin text-blue-600"
							/>
							<p className="font-medium">Processando vídeo...</p>
							<p className="text-center text-muted-foreground text-sm">
								As imagens serão disponibilizadas quando o processamento for concluído.
								<br />
								Progresso atual: {report.percentStatusProcess}%
							</p>
							<Progress value={report.percentStatusProcess} className="h-2 w-64" />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
