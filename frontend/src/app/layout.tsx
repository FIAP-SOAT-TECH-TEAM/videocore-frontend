import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../styles/index.css";
import { AppInitializer } from "@/components/app-initializer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "VideoCore",
	description: "Screenshots de vídeo simplificados",
	icons: {
		icon: {
			url: "../assets/favicon.png",
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning={true}>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem={true}
					disableTransitionOnChange={true}
				>
					<AppInitializer>{children}</AppInitializer>
					<Toaster position="top-right" />
				</ThemeProvider>
			</body>
		</html>
	);
}
