/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.DIST_DIR || '.next',
  reactStrictMode: false, // GSAP ScrollTrigger works more predictably with single-mount
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
