"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores";
import { LoadingScreen } from "./loading-screen";

interface GuestGuardProps {
	children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
	const router = useRouter();
	const { isHydrated } = useAuthHydration();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		// Redireciona usuário logado para dashboard
		if (isHydrated && isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isHydrated, isAuthenticated, router]);

	// Mostra loading enquanto hidrata
	if (!isHydrated) {
		return <LoadingScreen />;
	}

	// Redireciona se autenticado
	if (isAuthenticated) {
		return <LoadingScreen />;
	}

	// Renderiza conteúdo público
	return <>{children}</>;
}
