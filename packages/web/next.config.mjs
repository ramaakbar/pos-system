/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "export",
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
