import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chic Color Picker",
  description: "Modern color extraction for the web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased h-screen overflow-hidden flex flex-col`}
      >
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'glass border-border/50 shadow-xl',
              title: 'font-display font-semibold',
              description: 'text-muted-foreground',
            }
          }}
        />
      </body>
    </html>
  );
}
