import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "example.com",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "gateway.lighthouse.storage",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "lens.infura-ipfs.io",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "ipfs.infura.io",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "ipfs.io",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "arweave.net",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "gateway.ipfscdn.io",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "gateway.pinata.cloud",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "lens-dev-storage.s3.amazonaws.com",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "lens-dev-storage.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "lens-production-storage.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "lens-production-storage.s3.amazonaws.com",
      },
      // Lighthouse IPFS gateway
      {
        protocol: "https", // Assuming the image URL uses HTTPS
        hostname: "gateway.lighthouse.storage",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
