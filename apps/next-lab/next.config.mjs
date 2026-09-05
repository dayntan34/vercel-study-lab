/** @type {import('next').NextConfig} */
const nextConfig = {
  // Surfaces in the dashboard build logs / Settings > Functions
  poweredByHeader: true,
  logging: {
    fetches: { fullUrl: true },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'x-study-lab', value: 'next-lab' }],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/old-pricing', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/proxy-health', destination: '/api/hello' },
    ];
  },
};

export default nextConfig;
