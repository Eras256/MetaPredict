// Load .env files from root directory before Next.js processes it
// Next.js automatically loads .env.local from frontend/ directory, but we also load from root
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });

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
  webpack: (config, { isServer, webpack }) => {
    // Fix para Thirdweb y ethers
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
    
    // Crear plugins para reemplazar módulos de React Native con stubs
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@react-native-async-storage\/async-storage/,
        require.resolve('./webpack-stubs/async-storage-stub.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^pino-pretty$/,
        require.resolve('./webpack-stubs/pino-pretty-stub.js')
      )
    );
    
    // Ignorar warnings de módulos opcionales de forma más agresiva
    config.ignoreWarnings = [
      { module: /@react-native-async-storage\/async-storage/ },
      { module: /pino-pretty/ },
      { file: /@react-native-async-storage\/async-storage/ },
      { file: /pino-pretty/ },
      // Ignorar warnings de MetaMask SDK
      { module: /@metamask\/sdk/ },
      // Ignorar warnings de pino
      { module: /pino\/lib\/tools/ },
    ];
    
    return config;
  },
  // Suprimir warnings de compilación en la consola
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Logging reducido
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = withPWA(nextConfig);
