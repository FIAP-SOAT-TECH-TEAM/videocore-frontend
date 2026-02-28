"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadModal } from "@/components/upload-modal";
import { useReportsStore } from "@/stores";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function VideosPage() {
	const reports = useReportsStore((state) => state.reports).sort(
		(a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime(),
	);

	const isLoading = useReportsStore((state) => state.isLoading);
	const error = useReportsStore((state) => state.error);
	const fetchReports = useReportsStore((state) => state.fetchReports);

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Meus Vídeos</h1>
					<p className="text-muted-foreground">Gerencie seus vídeos e processamentos</p>
				</div>
				<UploadModal>
					<Button>Novo Upload</Button>
				</UploadModal>
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
					<p className="font-medium text-red-800 text-sm dark:text-red-200">
						Erro ao carregar vídeos
					</p>
					<p className="text-red-700 text-sm dark:text-red-300">{error}</p>
				</div>
			)}

			{isLoading ? (
				<div className="flex flex-col gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			) : (
				<DataTable columns={columns} data={reports} />
			)}
		</div>
	);
}
