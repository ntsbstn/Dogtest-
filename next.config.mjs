/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.dog.ceo',
        pathname: '/breeds/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.thedogapi.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
