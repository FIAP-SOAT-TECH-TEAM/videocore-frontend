export function LoadingScreen() {
	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				<div className="relative h-16 w-16">
					<div className="absolute inset-0 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
					<div className="absolute inset-2 animate-spin rounded-full border-4 border-t-transparent border-r-primary/50 border-b-transparent border-l-transparent [animation-direction:reverse] [animation-duration:1.5s]" />
				</div>
				<p className="text-muted-foreground text-sm">Carregando...</p>
			</div>
		</div>
	);
}
