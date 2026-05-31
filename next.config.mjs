/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;