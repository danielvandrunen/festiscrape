/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    // Add support for ESM modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    };
    
    return config;
  }
};

export default nextConfig; 