"use client";

import { Download01Icon, Eye, MoreHorizontal } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { fetchVideoImagesDownloadUrl } from "@/lib/api";
import type { ProcessStatus, Report } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

const statusConfig: Record<
	ProcessStatus,
	{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
	COMPLETED: { label: "Concluído", variant: "default" },
	PROCESSING: { label: "Processando", variant: "secondary" },
	STARTED: { label: "Iniciado", variant: "outline" },
	FAILED: { label: "Falhou", variant: "destructive" },
};

function ActionsCell({ report }: { report: Report }) {
	const [isDownloading, setIsDownloading] = React.useState(false);

	const handleDownloadZip = async () => {
		setIsDownloading(true);
		try {
			const response = await fetchVideoImagesDownloadUrl(report.requestId, report.videoName);
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
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
				<span className="sr-only">Abrir menu</span>
				<HugeiconsIcon icon={MoreHorizontal} className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem render={<Link href={`/dashboard/videos/details?id=${report.id}`}/>}>
					<HugeiconsIcon icon={Eye} className="mr-2 h-4 w-4" />
					Ver detalhes
				</DropdownMenuItem>
				{report.status === "COMPLETED" && (
					<DropdownMenuItem onClick={handleDownloadZip} disabled={isDownloading}>
						<HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
						{isDownloading ? "Obtendo link..." : "Baixar ZIP"}
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export const columns: ColumnDef<Report>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Selecionar todos"
				className="translate-y-0.5"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Selecionar linha"
				className="translate-y-0.5"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "videoName",
		header: "Nome do Vídeo",
		cell: ({ row }) => {
			const report = row.original;
			return (
				<div className="flex flex-col">
					<span className="max-w-50 truncate font-medium">{report.videoName}</span>
					<span className="text-muted-foreground text-xs">
						Intervalo: {report.frameCutMinutes} min
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as ProcessStatus;
			const config = statusConfig[status];
			return <Badge variant={config.variant}>{config.label}</Badge>;
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "percentStatusProcess",
		header: "Progresso",
		cell: ({ row }) => {
			const percent = row.getValue("percentStatusProcess") as number;
			const status = row.original.status;

			if (status === "COMPLETED") {
				return <span className="text-muted-foreground text-sm">100%</span>;
			}

			if (status === "FAILED") {
				return <span className="text-destructive text-sm">Erro</span>;
			}

			return (
				<div className="flex items-center gap-2">
					<Progress value={percent} className="h-2 w-20" />
					<span className="text-muted-foreground text-sm">{percent}%</span>
				</div>
			);
		},
	},
	{
		accessorKey: "reportTime",
		header: "Data",
		cell: ({ row }) => {
			const date = row.getValue("reportTime") as string;
			return (
				<span className="text-muted-foreground">{new Date(date).toLocaleDateString("pt-BR")}</span>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => <ActionsCell report={row.original} />,
	},
];
