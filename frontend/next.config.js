// Load .env from root directory before Next.js processes it
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },
  // Headers para permitir extensiones de wallet
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fix para Thirdweb y ethers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        // Módulos opcionales de React Native y pino (warnings normales, ignorar)
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };
      
      // Ignorar warnings de módulos opcionales
      config.ignoreWarnings = [
        { module: /@react-native-async-storage\/async-storage/ },
        { module: /pino-pretty/ },
      ];
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
