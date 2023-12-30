
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['source.unsplash.com'],
    domains: [],
  },
  // ... any other existing configuration
  env: {
      CLIENTID: process.env.CLIENTID,
      OKTASECRET: process.env.OKTASECRECRET,
      YOUROKTADOMAIN: process.env.YOUROKTADOMAIN,
    },
}

module.exports = nextConfig;
