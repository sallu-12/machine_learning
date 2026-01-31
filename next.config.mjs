/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable Next/Turbopack dev indicators and overlay in development
  // Set to false to hide the dev tools UI (requires dev server restart)
  devIndicators: false,
}

export default nextConfig
