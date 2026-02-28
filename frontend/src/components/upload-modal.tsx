"use client";

import { Cancel01Icon, Upload01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { fetchVideoUploadUrls, uploadFileToBlobStorage } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_FILES = 3;

interface UploadModalProps {
	children: React.ReactNode;
}

export function UploadModal({ children }: UploadModalProps) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [isDragging, setIsDragging] = React.useState(false);
	const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
	const [frameCut, setFrameCut] = React.useState("2");
	const [isUploading, setIsUploading] = React.useState(false);
	const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const resetState = () => {
		setSelectedFiles([]);
		setFrameCut("2");
		setIsUploading(false);
		setUploadProgress({});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (isUploading) return;
		setOpen(nextOpen);
		if (!nextOpen) resetState();
	};

	const addFiles = (files: FileList | File[]) => {
		const videoFiles = Array.from(files).filter((f) => f.type.startsWith("video/"));
		if (videoFiles.length === 0) {
			toast.error("Por favor, selecione arquivos de vídeo válidos");
			return;
		}

		setSelectedFiles((prev) => {
			const combined = [...prev, ...videoFiles];
			const unique = combined.filter(
				(file, index, self) => self.findIndex((f) => f.name === file.name) === index,
			);
			if (unique.length > MAX_FILES) {
				toast.error(`Máximo de ${MAX_FILES} vídeos por upload`);
				return unique.slice(0, MAX_FILES);
			}
			return unique;
		});
	};

	const removeFile = (fileName: string) => {
		setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		addFiles(e.dataTransfer.files);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			addFiles(e.target.files);
		}
		e.target.value = "";
	};

	const totalProgress = React.useMemo(() => {
		if (selectedFiles.length === 0) return 0;
		const values = Object.values(uploadProgress);
		if (values.length === 0) return 0;
		return Math.round(values.reduce((a, b) => a + b, 0) / selectedFiles.length);
	}, [uploadProgress, selectedFiles.length]);

	const handleUpload = async () => {
		if (selectedFiles.length === 0) return;

		setIsUploading(true);
		setUploadProgress({});

		try {
			const videoNames = selectedFiles.map((f) => f.name);
			const uploadUrlResponses = await fetchVideoUploadUrls(videoNames);

			const uploadPromises = selectedFiles.map((file, index) => {
				const response = uploadUrlResponses[index];
				if (!response) {
					throw new Error(`Nenhuma URL de upload retornada para ${file.name}`);
				}

				const metadata = {
					user_id: response.userId,
					request_id: response.requestId,
					frame_cut: frameCut,
				};

				return uploadFileToBlobStorage(response.url, file, metadata, (percent) => {
					setUploadProgress((prev) => ({ ...prev, [file.name]: percent }));
				});
			});

			await Promise.all(uploadPromises);

			toast.success(
				selectedFiles.length === 1
					? "Vídeo enviado com sucesso!"
					: `${selectedFiles.length} vídeos enviados com sucesso!`,
				{
					description: "O processamento será iniciado automaticamente.",
				},
			);

			setOpen(false);
			resetState();
			router.push("/dashboard/videos");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro desconhecido";
			toast.error("Erro ao enviar vídeo(s)", { description: message });
		} finally {
			setIsUploading(false);
			setUploadProgress({});
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger nativeButton={false} render={<span />}>
				{children}
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl" showCloseButton={!isUploading}>
				<DialogHeader>
					<DialogTitle className="text-lg">Upload de Vídeo</DialogTitle>
					<DialogDescription>
						Envie até {MAX_FILES} vídeos para extrair screenshots automaticamente
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<button
						type="button"
						tabIndex={0}
						className={cn(
							"relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
							isDragging
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25 hover:border-primary/50",
						)}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="video/*"
							multiple={true}
							onChange={handleFileSelect}
							className="hidden"
						/>

						<div className="flex flex-col items-center gap-3 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<HugeiconsIcon icon={Upload01Icon} className="h-6 w-6 text-muted-foreground" />
							</div>
							<div>
								<p className="font-medium text-sm">Arraste seus vídeos aqui</p>
								<p className="text-muted-foreground text-xs">
									ou clique para selecionar — MP4, MOV, AVI, MKV
								</p>
							</div>
						</div>
					</button>

					{/* Selected Files */}
					{selectedFiles.length > 0 && (
						<div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
							<p className="font-medium text-sm">
								{selectedFiles.length} de {MAX_FILES} vídeo(s) selecionado(s)
							</p>
							{selectedFiles.map((file) => (
								<div key={file.name} className="flex items-center gap-3 rounded-lg border p-2.5">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
										<HugeiconsIcon icon={Video01Icon} className="h-4 w-4 text-primary" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">{file.name}</p>
										<p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
									</div>
									{isUploading && uploadProgress[file.name] !== undefined ? (
										<div className="flex w-20 items-center gap-2">
											<Progress value={uploadProgress[file.name]} className="h-1.5" />
											<span className="text-muted-foreground text-xs">
												{uploadProgress[file.name]}%
											</span>
										</div>
									) : (
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 shrink-0"
											onClick={(e) => {
												e.stopPropagation();
												removeFile(file.name);
											}}
											disabled={isUploading}
										>
											<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					)}

					{/* Settings */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="frameCut">Intervalo de Captura</Label>
						<Select value={frameCut} onValueChange={(value) => value && setFrameCut(value)}>
							<SelectTrigger id="frameCut">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">A cada 1 minuto</SelectItem>
								<SelectItem value="2">A cada 2 minutos</SelectItem>
								<SelectItem value="3">A cada 3 minutos</SelectItem>
								<SelectItem value="5">A cada 5 minutos</SelectItem>
								<SelectItem value="10">A cada 10 minutos</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Uma screenshot será capturada a cada {frameCut} minuto(s) do vídeo.
						</p>
					</div>

					{/* Upload Progress */}
					{isUploading && (
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Progresso total</span>
								<span className="font-medium">{totalProgress}%</span>
							</div>
							<Progress value={totalProgress} className="h-2" />
						</div>
					)}

					{/* Submit Button */}
					<Button
						className="w-full"
						size="lg"
						disabled={selectedFiles.length === 0 || isUploading}
						onClick={handleUpload}
					>
						{isUploading ? (
							<>
								<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Enviando... {totalProgress}%
							</>
						) : (
							<>
								<HugeiconsIcon icon={Upload01Icon} className="mr-2 h-4 w-4" />
								{selectedFiles.length <= 1
									? "Enviar Vídeo"
									: `Enviar ${selectedFiles.length} Vídeos`}
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
