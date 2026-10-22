import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://adventure.madprotekcorp.com"),
  title: "MADPROTEK Adventure Trail 2026 | 4x4 Off-Road Experience",
  description:
    "MADPROTEK Adventure Trail 2026 — a two-day technical 4x4 off-road experience at Urigam Village near the Hosur–Bengaluru corridor, featuring 15+ natural and technical obstacles and 50+ registrations.",
  keywords: [
    "MADPROTEK",
    "4x4 off-road",
    "Adventure Trail 2026",
    "Urigam Village",
    "South India off-road",
    "15+ natural and technical obstacles",
    "rock crawl",
    "Bengaluru 4x4",
  ],
  authors: [{ name: "MADPROTEK Off-Road Experiences" }],
  openGraph: {
    title: "MADPROTEK Adventure Trail 2026 | 4x4 Off-Road Experience",
    description:
      "A two-day technical 4x4 off-road experience at Urigam Village near the Hosur–Bengaluru corridor. 15+ natural and technical obstacles. 50+ registrations.",
    url: "https://adventure.madprotekcorp.com",
    siteName: "MADPROTEK Adventure Trail",
    images: [
      {
        url: "/video-poster.webp",
        width: 1920,
        height: 1080,
        alt: "MADPROTEK Adventure Trail 4x4 Proving Ground",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MADPROTEK Adventure Trail 2026",
    description: "South India's Premier Off-Road Technical Proving Ground. 14–15 November 2026.",
    images: ["/video-poster.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable} font-sans scroll-smooth`}>
      <body className="bg-sand-50 text-neutral-900 min-h-screen selection:bg-amber-600 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
