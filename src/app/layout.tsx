import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { PendingConfirmationsBanner } from "@/components/pending-confirmations-banner";

const inter = Inter({
 subsets: ["latin"],
 variable: "--font-inter",
});

export const metadata: Metadata = {
 title: "StudentRide - University Rideshare Platform",
 description: "The trusted rideshare platform exclusively for university students. Save money, reduce emissions, and connect with fellow students.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
 <Providers>
 <Navbar />
 <PendingConfirmationsBanner />
 <main className="flex-1">{children}</main>
 </Providers>
 </body>
 </html>
 );
}
