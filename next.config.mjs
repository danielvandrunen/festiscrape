/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for undici module
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': 'node-fetch',
    };
    
    // Add transpilePackages for ESM modules
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
};

export default nextConfig; 