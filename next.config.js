/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  images: {
    domains: ['image.tmdb.org', 'www.themoviedb.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  env: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig