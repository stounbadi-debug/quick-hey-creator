import { Metadata } from 'next'
import LandingClient from '@/components/pages/LandingClient'

export const metadata: Metadata = {
  title: 'CineDiscover - AI-Powered Movie Discovery Platform',
  description: 'Discover your perfect movie with AI-powered recommendations, intelligent search, and cinematic discovery tools powered by Gemini AI.',
  openGraph: {
    title: 'CineDiscover - AI-Powered Movie Discovery Platform',
    description: 'Discover your perfect movie with AI-powered recommendations, intelligent search, and cinematic discovery tools powered by Gemini AI.',
  },
}

export default function HomePage() {
  return <LandingClient />
}