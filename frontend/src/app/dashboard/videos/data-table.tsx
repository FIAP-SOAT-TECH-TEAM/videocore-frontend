"use client";

import { FilterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Pagination } from "@/types";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pagination: Pagination;
	setPage: Dispatch<SetStateAction<number>>;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pagination,
	setPage,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState<string | null>("all");

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			globalFilter,
		},
		initialState: {
			pagination: {
				pageSize: pagination.size,
			},
		},
		enableRowSelection: true,
		manualPagination: true,
		pageCount: pagination.totalPages,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const handleStatusChange = (value: string | null) => {
		setStatusFilter(value);
		table.getColumn("status")?.setFilterValue(value === "all" ? undefined : [value]);
	};

	const statusLabels: Record<string, string> = {
		all: "Todos",
		COMPLETED: "Concluídos",
		PROCESSING: "Processando",
		STARTED: "Iniciados",
		FAILED: "Falhos",
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-1 items-center gap-2">
					<div className="relative w-full max-w-sm">
						<HugeiconsIcon
							icon={Search01Icon}
							className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							placeholder="Buscar vídeos..."
							value={globalFilter ?? ""}
							onChange={(event) => setGlobalFilter(event.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={statusFilter} onValueChange={handleStatusChange}>
						<SelectTrigger className="w-45">
							<HugeiconsIcon icon={FilterIcon} className="mr-2 h-4 w-4" />
							<SelectValue>{statusLabels[statusFilter ?? "all"]}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							<SelectItem value="COMPLETED">Concluídos</SelectItem>
							<SelectItem value="PROCESSING">Processando</SelectItem>
							<SelectItem value="STARTED">Iniciados</SelectItem>
							<SelectItem value="FAILED">Falhos</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Nenhum vídeo encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between px-2">
				<div className="text-muted-foreground text-sm">
					{table.getFilteredSelectedRowModel().rows.length} de{" "}
					{table.getFilteredRowModel().rows.length} vídeo(s) selecionado(s).
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((prev) => prev - 1)}
						disabled={!pagination.hasPrevious}
					>
						Anterior
					</Button>
					<div className="text-muted-foreground text-sm">
						Página {pagination.page + 1} de {pagination.totalPages}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((prev) => prev + 1)}
						disabled={!pagination.hasNext}
					>
						Próxima
					</Button>
				</div>
			</div>
		</div>
	);
}
