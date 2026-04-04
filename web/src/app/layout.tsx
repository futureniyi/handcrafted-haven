import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import AppHeader from "./AppHeader";
import { getServerSessionFromCookies } from "@/lib/auth";
import SessionProvider from "./SessionProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | Handcrafted Haven",
    default: "Handcrafted Haven",
  },
  description:
    "Handcrafted Haven is a community-driven marketplace where artisans and crafters showcase and sell unique handmade products, connecting conscious consumers with sustainable, locally inspired creations.",
  metadataBase: new URL("https://handcrafted-haven.vercel.app"),
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSessionFromCookies();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider initialSession={session}>
          <AppHeader />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
