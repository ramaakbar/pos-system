import { fileURLToPath } from "url";
import createJiti from "jiti";

createJiti(fileURLToPath(import.meta.url))("./src/env/client");
createJiti(fileURLToPath(import.meta.url))("./src/env/server");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
