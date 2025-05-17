import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuidedTour from "@/components/GuidedTour";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaseCanopy - Justice, Discovered",
  description:
    "AI-powered legal precedent discovery platform for environmental justice litigation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="min-h-screen flex flex-col bg-black">
          <Navbar />
          <GuidedTour />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
