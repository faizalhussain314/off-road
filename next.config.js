/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next_prod',
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
