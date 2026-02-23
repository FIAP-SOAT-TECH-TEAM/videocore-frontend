"use client";

import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted focus:outline-none">
				<HugeiconsIcon
					icon={Sun01Icon}
					className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<HugeiconsIcon
					icon={Moon01Icon}
					className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span className="sr-only">Alternar tema</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
