"use client";

import {
	AlertCircleIcon,
	CheckmarkCircle01Icon,
	Loading01Icon,
	Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadModal } from "@/components/upload-modal";
import { useReportsStore } from "@/stores";
import type { ProcessStatus } from "@/types";

const statusConfig: Record<
	ProcessStatus,
	{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
	COMPLETED: { label: "Concluído", variant: "default" },
	PROCESSING: { label: "Processando", variant: "secondary" },
	STARTED: { label: "Iniciado", variant: "outline" },
	FAILED: { label: "Falhou", variant: "destructive" },
};

export default function DashboardPage() {
	const reports = useReportsStore((state) => state.reports);
	const isLoading = useReportsStore((state) => state.isLoading);
	const error = useReportsStore((state) => state.error);
	const fetchReports = useReportsStore((state) => state.fetchReports);
	const getDashboardStats = useReportsStore((state) => state.getDashboardStats);

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	const stats = getDashboardStats();
	const recentReports = reports.slice(0, 3);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">Visão geral dos seus vídeos e processamentos</p>
				</div>
				<UploadModal>
					<Button>Novo Upload</Button>
				</UploadModal>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total de Vídeos</CardTitle>
						<HugeiconsIcon icon={Video01Icon} className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<>
								<div className="font-bold text-2xl">{stats.total}</div>
								<p className="text-muted-foreground text-xs">processamentos registrados</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Concluídos</CardTitle>
						<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<>
								<div className="font-bold text-2xl">{stats.completed}</div>
								<p className="text-muted-foreground text-xs">processamentos finalizados</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Em Andamento</CardTitle>
						<HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<>
								<div className="font-bold text-2xl">{stats.processing}</div>
								<p className="text-muted-foreground text-xs">vídeos processando</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Falharam</CardTitle>
						<HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<>
								<div className="font-bold text-2xl">{stats.failed}</div>
								<p className="text-muted-foreground text-xs">processamentos com erro</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Error State */}
			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
					<div className="flex gap-3">
						<HugeiconsIcon
							icon={AlertCircleIcon}
							className="h-5 w-5 text-red-600 dark:text-red-400"
						/>
						<div className="text-sm">
							<p className="font-medium text-red-800 dark:text-red-200">Erro ao carregar dados</p>
							<p className="text-red-700 dark:text-red-300">{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* Recent Reports */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-lg">Processamentos Recentes</h2>
					<Link href={"/dashboard/videos" as never}>
						<Button variant="ghost" size="sm">
							Ver todos
						</Button>
					</Link>
				</div>

				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{["a", "b", "c"].map((id) => (
							<Card key={`skeleton-${id}`}>
								<CardContent className="p-4">
									<Skeleton className="mb-2 h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>
						))}
					</div>
				) : recentReports.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<HugeiconsIcon icon={Video01Icon} className="mb-4 h-12 w-12 text-muted-foreground" />
							<p className="font-medium">Nenhum processamento encontrado</p>
							<p className="text-muted-foreground text-sm">Faça upload de um vídeo para começar</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{recentReports.map((report) => (
							<Link
								key={report.id}
								href={`/dashboard/videos/details?requestId=${report.requestId}` as never}
							>
								<Card className="overflow-hidden transition-colors hover:bg-muted/50">
									<CardContent className="p-4">
										<h3 className="truncate font-medium">{report.videoName}</h3>
										<div className="mt-2 flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												{new Date(report.reportTime).toLocaleDateString("pt-BR")}
											</span>
											<Badge variant={statusConfig[report.status].variant}>
												{statusConfig[report.status].label}
											</Badge>
										</div>
										{(report.status === "PROCESSING" || report.status === "STARTED") && (
											<div className="mt-2">
												<Progress value={report.percentStatusProcess} className="h-1.5" />
												<p className="mt-1 text-muted-foreground text-xs">
													{report.percentStatusProcess}%
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
