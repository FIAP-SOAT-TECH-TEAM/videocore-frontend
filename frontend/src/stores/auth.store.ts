import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cognitoSignIn, cognitoSignOut, getAuthSubject, getUserAttributes } from "@/lib/cognito";
import type { User } from "@/types";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isHydrated: boolean;
}

interface AuthActions {
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	setUser: (user: User | null) => void;
	setHydrated: (value: boolean) => void;
	refreshSession: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			isHydrated: false,

			login: async (email: string, password: string) => {
				set({ isLoading: true });

				try {
					const result = await cognitoSignIn(email, password);

					if (result.isSignedIn) {
						const attrs = await getUserAttributes();

						if (attrs) {
							const user: User = {
								id: attrs.sub,
								email: attrs.email,
								name: attrs.name || attrs.preferred_username || email.split("@")[0]
							};

							set({
								user,
								isAuthenticated: true,
								isLoading: false,
							});
						} else {
							throw new Error("Não foi possível obter dados do usuário");
						}
					} else {
						throw new Error("Login incompleto. Verifique suas credenciais.");
					}
				} catch (error) {
					set({ isLoading: false });
					throw error;
				}
			},

			logout: async () => {
				try {
					await cognitoSignOut();
				} catch (_error) {
					// erro ao fazer logout no Cognito
				}
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			setUser: (user) => {
				set({
					user,
					isAuthenticated: !!user,
				});
			},

			setHydrated: (value) => {
				set({ isHydrated: value });
			},

			refreshSession: async () => {
				try {
					const sub = await getAuthSubject();
					if (!sub) {
						set({ user: null, isAuthenticated: false });
						return;
					}

					const attrs = await getUserAttributes();
					if (attrs) {
						set({
							user: {
								id: attrs.sub,
								email: attrs.email,
								name: attrs.name || attrs.preferred_username || attrs.email.split("@")[0]
							},
							isAuthenticated: true,
						});
					}
				} catch {
					set({ user: null, isAuthenticated: false });
				}
			},
		}),
		{
			name: "videocore-auth",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHydrated(true);
			},
		},
	),
);
