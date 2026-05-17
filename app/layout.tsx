import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import NetworkGuard from "@/components/NetworkGuard";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Syncred | Async Credit & Payment Protocol",
  description: "Decentralized async lending and payment verification on Rialo Testnet",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Syncred — Async Credit Protocol",
    description: "Most blockchains process transactions instantly. We process workflows.",
    type: "website",
  },
  keywords: ["DeFi", "lending", "async", "blockchain", "Rialo", "testnet", "Goerli"],
};

export const viewport: Viewport = {
  themeColor: "#00f5ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <NetworkGuard />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#161b27",
                color: "#e2e8f0",
                border: "1px solid #1e2535",
                borderRadius: "12px",
                fontSize: "14px",
                maxWidth: "380px",
              },
              success: { iconTheme: { primary: "#00ff87", secondary: "#080b14" }, duration: 4000 },
              error: { iconTheme: { primary: "#ff006e", secondary: "#080b14" }, duration: 5000 },
              loading: { iconTheme: { primary: "#00f5ff", secondary: "#080b14" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
