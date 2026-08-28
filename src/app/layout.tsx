import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaProvider } from "@/components/pwa/PwaProvider";

export const metadata: Metadata = {
  title: "DOTO — Personal Work OS for Developers",
  description: "Zero context loss productivity OS. Resume where you stopped, know what matters today, plan tomorrow.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DOTO",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-zinc-700 selection:text-white">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
