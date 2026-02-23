"use client";

import { Home01Icon, Logout01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores";

const menuItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home01Icon,
	},
	{
		title: "Meus Vídeos",
		url: "/dashboard/videos",
		icon: Video01Icon,
	},
];

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = async () => {
		await logout();
		toast.success("Logout realizado com sucesso!");
		router.push("/auth/login");
	};

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<HugeiconsIcon icon={Video01Icon} className="h-4 w-4" />
					</div>
					<span className="font-semibold text-lg">VideoCore</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<Link href={item.url as never}>
										<SidebarMenuButton isActive={pathname === item.url}>
											<HugeiconsIcon icon={item.icon} />
											<span>{item.title}</span>
										</SidebarMenuButton>
									</Link>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger render={<SidebarMenuButton className="w-full" />}>
								<Avatar className="h-6 w-6">
									{user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
									<AvatarFallback className="text-xs">
										{user?.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="truncate">{user?.name}</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
								<DropdownMenuItem onClick={handleLogout}>
									<HugeiconsIcon icon={Logout01Icon} className="mr-2 h-4 w-4" />
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
