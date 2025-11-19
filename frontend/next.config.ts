import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-avatar',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
      'recharts',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
    // Reduce unnecessary re-renders
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Webpack optimizations (for production builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side bundle
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for large dependencies
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate three.js and heavy 3D libraries
            threejs: {
              name: 'threejs',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 30,
            },
            // Separate UI libraries
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              priority: 25,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
