import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CircuitAI - AI-Powered Robotics Project Generator for Students",
  description: "Generate complete Arduino robotics projects in minutes with AI. Includes circuit diagrams, code, wiring guides, and documentation. Perfect for STEM education and students.",
  keywords: "Arduino projects, robotics, STEM education, AI project generator, circuit diagrams, Arduino code, robotics for students, electronics projects, maker education",
  authors: [{ name: "AahilWorks", url: "https://aahilworks.github.io" }],
  creator: "AahilWorks",
  openGraph: {
    title: "CircuitAI - AI-Powered Robotics Project Generator",
    description: "Generate complete Arduino robotics projects in minutes with AI. Perfect for STEM education.",
    url: "https://www.circuitai.in",
    siteName: "CircuitAI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CircuitAI - AI-Powered Robotics Project Generator",
    description: "Generate complete Arduino robotics projects in minutes with AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
