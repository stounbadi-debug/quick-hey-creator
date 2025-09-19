import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CineDiscover - AI-Powered Movie Discovery Platform | Lunim',
  description: 'Discover your perfect movie with AI-powered recommendations, intelligent search, and cinematic discovery tools. Built with Next.js 14 and Gemini AI.',
  keywords: [
    'movies', 
    'AI recommendations', 
    'cinema discovery', 
    'Gemini AI', 
    'TMDB', 
    'entertainment',
    'Lunim'
  ],
  authors: [{ name: 'Lunim' }],
  creator: 'Lunim',
  publisher: 'Lunim',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinediscover.lunim.com',
    siteName: 'CineDiscover',
    title: 'CineDiscover - AI-Powered Movie Discovery Platform',
    description: 'Discover your perfect movie with AI-powered recommendations and intelligent search.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CineDiscover - AI Movie Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineDiscover - AI-Powered Movie Discovery',
    description: 'Discover your perfect movie with AI-powered recommendations and intelligent search.',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    // Add your verification codes here for production
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://cinediscover.lunim.com" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} font-inter antialiased`}>
        <ReactQueryProvider>
          <TooltipProvider>
            <main>{children}</main>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}