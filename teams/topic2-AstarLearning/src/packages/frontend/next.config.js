/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: "/flipper-ui",
  async rewrites() {
    return [
      {
        source: "/flipper-ui/api/:path*",
        destination: "/api/:path*",
      },
      {
        source: "/flipper-ui/images/:query*",
        destination: '/_next/image/:query*'
      },
      {
        source: "/flipper-ui/_next/:path*",
        destination: "/_next/:path*",
      },
    ]
  }
}

module.exports = nextConfig
