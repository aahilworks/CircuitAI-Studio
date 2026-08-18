import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/lib/hooks/useCurrency";

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
  title: "CircuitAI - AI-Powered Robotics Project Generator for Students | Arduino Projects",
  description: "Generate complete Arduino robotics projects in minutes with AI. Includes circuit diagrams, code, wiring guides, and documentation. Perfect for STEM education, students worldwide, and robotics for beginners. Best Arduino project maker online.",
  keywords: "CircuitAI, AI robotics project generator, Arduino project maker, STEM education tools, robotics for students, Arduino code generator, circuit diagram generator, electronics projects, maker education, robotics learning platform, Arduino projects, robotics projects, STEM education, Arduino projects, circuit diagram, electronics projects, Arduino code, robotics for beginners, Arduino tutorial, STEM activities, Arduino project ideas, robotics kit, Arduino sensors, Arduino programming, circuit design, electronics for beginners, robotics competition, STEM curriculum, Arduino UNO projects, robotics engineering, Arduino car project, Arduino robot arm, Arduino home automation, Arduino weather station, Arduino LED projects, Arduino motor control, Arduino sensor projects, Arduino IoT projects, Arduino Bluetooth projects, Arduino WiFi projects, Arduino for students, robotics for schools, STEM education tools, Arduino learning, robotics education, electronics education, maker education, project-based learning, hands-on learning, engineering projects, AI projects, machine learning projects, AI education, technology in education, EdTech tools, digital learning, AI for students, robotics AI, smart projects, automation projects, Arduino project help, robotics project services, STEM education solutions, Arduino consulting, robotics training, electronics design services, project assistance, Arduino development, robotics development, educational technology, AI-powered education, smart classroom, robotics in education, digital STEM, AI learning tools, virtual robotics, online Arduino, remote learning robotics, EdTech solutions, future of education",
  authors: [{ name: "AahilWorks", url: "https://aahilworks.github.io" }],
  creator: "AahilWorks",
  openGraph: {
    title: "CircuitAI - AI-Powered Robotics Project Generator for Students",
    description: "Generate complete Arduino robotics projects in minutes with AI. Best STEM education tool for students worldwide, robotics for beginners, and Arduino project maker online.",
    url: "https://www.circuitai.in",
    siteName: "CircuitAI",
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CircuitAI - AI-Powered Robotics Project Generator for Students",
    description: "Generate complete Arduino robotics projects in minutes with AI. Best STEM education tool for students worldwide.",
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CircuitAI',
    url: 'https://www.circuitai.in',
    logo: 'https://www.circuitai.in/icon.svg',
    description: 'AI-Powered Robotics Project Generator for Students. Generate complete Arduino robotics projects with circuit diagrams, code, and documentation.',
    founder: {
      '@type': 'Person',
      name: 'AahilWorks',
      url: 'https://aahilworks.github.io',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@circuitai.in',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://github.com/aahilworks',
    ],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CircuitAI',
    url: 'https://www.circuitai.in',
    description: 'AI-Powered Robotics Project Generator for Indian Students',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.circuitai.in/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'CircuitAI Pro Subscription',
    description: 'AI-powered Arduino project generator with unlimited generations, circuit diagrams, and advanced features for STEM education.',
    image: 'https://www.circuitai.in/icon.svg',
    brand: {
      '@type': 'Brand',
      name: 'CircuitAI',
    },
    offers: {
      '@type': 'Offer',
      price: '699',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: 'https://www.circuitai.in/pricing',
    },
    category: 'Educational Technology',
    audience: {
      '@type': 'Audience',
      audienceType: 'Students',
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#09090b" />
        <meta name="msapplication-TileColor" content="#09090b" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}
