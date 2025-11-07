import { ThemeProvider } from "next-themes";
import "./globals.css";

import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className="bg-linear-to-br from-sky-950 to-sky-900 text-white">
				<ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
					<div className="flex flex-col items-center justify-center min-h-screen">
						{children}

						<footer className="absolute bottom-4 text-sm text-sky-300">
							© {new Date().getFullYear()} Fattor — Pesquisa de Clientes
						</footer>
					</div>

					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
