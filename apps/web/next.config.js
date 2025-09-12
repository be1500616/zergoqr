/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@zergoqr/shared', '@zergoqr/ui', '@zergoqr/db'],
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
