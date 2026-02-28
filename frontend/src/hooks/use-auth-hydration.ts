import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";

export function useAuthHydration() {
	const [isHydrated, setIsHydrated] = useState(false);
	const isStoreHydrated = useAuthStore((state) => state.isHydrated);

	useEffect(() => {
		if (isStoreHydrated) {
			setIsHydrated(true);
		}
	}, [isStoreHydrated]);

	return { isHydrated };
}
