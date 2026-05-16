import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Syncred | Async Credit & Payment Protocol",
  description: "Decentralized async lending and payment verification on Rialo",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
