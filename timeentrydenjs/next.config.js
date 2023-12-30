/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['source.unsplash.com'],
    },
    // ... any other existing configuration
    env: {
        CLIENTID: process.env.CLIENTID,
        OKTASECRET: process.env.OKTASECRECRET,
        YOUROKTADOMAIN: process.env.YOUROKTADOMAIN,
      },
  }
  
  module.exports = nextConfig;
  