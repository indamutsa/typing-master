import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SettingsDrawer from "@/components/SettingsDrawer";
import ServerSync from "@/components/ServerSync";
import Providers from "@/components/Providers";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "TypeMaster — AI Typing Trainer",
  description: "AI-powered typing trainer that targets your weak keys",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="bg-zinc-950 text-zinc-200 antialiased min-h-screen font-mono">
        <Providers>
          <Navbar />
          <SettingsDrawer />
          <ServerSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
