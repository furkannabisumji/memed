/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Lens Protocol image domains
      'ik.imagekit.io',
      'lens.infura-ipfs.io',
      'ipfs.infura.io',
      'ipfs.io',
      'arweave.net',
      'gateway.ipfscdn.io',
      'gateway.pinata.cloud',
      'lens-dev-storage.s3.amazonaws.com',
      'lens-dev-storage.s3.us-west-2.amazonaws.com',
      'lens-production-storage.s3.us-west-2.amazonaws.com',
      'lens-production-storage.s3.amazonaws.com',
      // Lighthouse IPFS gateway
      'gateway.lighthouse.storage',
      // Add any other domains you might need for images
    ],
  },
};

module.exports = nextConfig;
