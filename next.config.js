/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next' : '.next_prod'),
  reactStrictMode: false, // GSAP ScrollTrigger works more predictably with single-mount
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
