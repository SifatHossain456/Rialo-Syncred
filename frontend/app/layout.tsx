import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import NetworkGuard from "@/components/NetworkGuard";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Syncred | Async Credit & Payment Protocol",
  description: "Decentralized async lending and payment verification on Rialo",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 min-h-screen">
        <Providers>
          <Navbar />
          <NetworkGuard />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#161b27",
                color: "#e2e8f0",
                border: "1px solid #1e2535",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#00ff87", secondary: "#080b14" } },
              error: { iconTheme: { primary: "#ff006e", secondary: "#080b14" } },
              loading: { iconTheme: { primary: "#00f5ff", secondary: "#080b14" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
