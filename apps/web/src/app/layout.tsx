import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeScript } from "./theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MypesOS", template: "%s · MypesOS" },
  description: "Tus finanzas personales y empresariales en un solo lugar: captura, conecta, comprende y actúa.",
  applicationName: "MypesOS",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ToastProvider position="bottom-right">{children}</ToastProvider>
      </body>
    </html>
  );
}
