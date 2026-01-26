/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Only proxy API calls from the Vercel-hosted frontend.
    if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
      return [
        {
          source: "/api/:path*",
          destination: "https://ikobriqapp.duckdns.org/api/:path*",
        },
        {
          source: "/uploads/:path*",
          destination: "https://ikobriqapp.duckdns.org/uploads/:path*",
        },
      ]
    }
    return []
  },
}

export default nextConfig
