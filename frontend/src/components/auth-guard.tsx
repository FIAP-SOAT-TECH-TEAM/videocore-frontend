"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores";
import { LoadingScreen } from "./loading-screen";

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	const router = useRouter();
	const { isHydrated } = useAuthHydration();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		// Só redireciona após hidratação completa
		if (isHydrated && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isHydrated, isAuthenticated, router]);

	// Mostra loading enquanto hidrata
	if (!isHydrated) {
		return <LoadingScreen />;
	}

	// Redireciona se não autenticado
	if (!isAuthenticated) {
		return <LoadingScreen />;
	}

	// Renderiza conteúdo protegido
	return <>{children}</>;
}
