import { Metadata } from 'next'
import DiscoverClient from '@/components/pages/DiscoverClient'

export const metadata: Metadata = {
  title: 'Movie Discovery - CineDiscover',
  description: 'Explore trending movies, search for favorites, and get AI-powered recommendations tailored to your taste.',
  openGraph: {
    title: 'Movie Discovery - CineDiscover',
    description: 'Explore trending movies, search for favorites, and get AI-powered recommendations tailored to your taste.',
  },
}

export default function DiscoverPage() {
  return <DiscoverClient />
}