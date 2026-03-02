import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GeoTrack — Real-Time Global Intelligence Dashboard",
    template: "%s | GeoTrack",
  },
  description:
    "GeoTrack is a next-generation real-time global intelligence dashboard. Monitor geopolitical conflicts, financial markets, threat signals, and world events with AI-powered analysis, live data feeds, and interactive visualizations.",
  keywords: [
    "geopolitical intelligence",
    "global dashboard",
    "real-time monitoring",
    "conflict tracker",
    "threat analysis",
    "OSINT",
    "world events",
    "geopolitics",
    "market tracker",
    "country instability index",
    "news aggregator",
    "AI intelligence",
    "signal detection",
    "GeoTrack",
  ],
  authors: [{ name: "GeoTrack Team" }],
  creator: "GeoTrack",
  publisher: "GeoTrack",
  applicationName: "GeoTrack",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL("https://geotrack.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://geotrack.app",
    siteName: "GeoTrack",
    title: "GeoTrack — Real-Time Global Intelligence Dashboard",
    description:
      "Monitor geopolitical conflicts, financial markets, threat signals, and world events with AI-powered analysis and live data feeds.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "GeoTrack Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoTrack — Real-Time Global Intelligence Dashboard",
    description:
      "AI-powered global intelligence dashboard. Track conflicts, markets, and geopolitical signals in real-time.",
    images: ["/logo.png"],
    creator: "@geotrack",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f6" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
