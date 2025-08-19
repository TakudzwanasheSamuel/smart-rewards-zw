import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable problematic features for production
    instrumentationHook: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Handle Genkit and AI dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore problematic modules during build
    config.externals = config.externals || [];
    config.externals.push({
      '@opentelemetry/exporter-jaeger': 'commonjs @opentelemetry/exporter-jaeger',
      '@genkit-ai/firebase': 'commonjs @genkit-ai/firebase',
    });

    return config;
  },
  // Reduce bundle size and improve compatibility
  transpilePackages: ['genkit', '@genkit-ai/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
