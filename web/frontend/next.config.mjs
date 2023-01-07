/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.shopify.com"],
    unoptimized: true,
  },
  // exportPathMap: function () {
  //   return {
  //     "/": { page: "/" },
  //   };
  // },
};

export default nextConfig;
