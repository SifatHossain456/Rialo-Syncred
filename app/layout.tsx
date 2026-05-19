import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import NetworkGuard from "@/components/NetworkGuard";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Syncred | Async Lending Protocol",
  description: "Decentralized async lending and payment verification on Goerli Testnet — powered by Rialo.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Syncred — Async Lending Protocol",
    description: "DeFi that waits for the real world. Async execution, automated KYC, non-custodial settlement.",
    type: "website",
  },
  keywords: ["DeFi", "lending", "async", "blockchain", "Rialo", "Goerli", "testnet", "credit"],
};

export const viewport: Viewport = {
  themeColor: "#818cf8",
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
              success: { iconTheme: { primary: "#34d399", secondary: "#070714" }, duration: 4000 },
              error:   { iconTheme: { primary: "#f87171", secondary: "#070714" }, duration: 5000 },
              loading: { iconTheme: { primary: "#818cf8", secondary: "#070714" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
