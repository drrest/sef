import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MetamorphicBackground } from "@/components/ui/MetamorphicBackground";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEF Cloud Calculator",
  description: "SEF Cloud Calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-white`}
        suppressHydrationWarning
      >
        <Script id="ust-tracker-init" strategy="beforeInteractive">
          {`UST_CT = [];UST = { s: Date.now(), addTag: function(tag) { UST_CT.push(tag) } };UST.addEvent = UST.addTag;`}
        </Script>
        <Script
          src="https://tr.octahash.com/server/ust-rr.min.js?v=4.4.0"
          strategy="afterInteractive"
        />
        <MetamorphicBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <ProjectSwitcher />
          {children}
        </div>
      </body>
    </html>
  );
}
