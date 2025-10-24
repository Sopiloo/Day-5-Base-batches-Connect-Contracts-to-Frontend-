/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router is enabled by default in Next.js 14+
  // Configure webpack to handle SVG files
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg\?url$/,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
  // Add any other configurations you need here
  images: {
    domains: ['images.unsplash.com', 'ipfs.io'], // Add any image domains you need
  },
  // Enable static exports if needed
  // output: 'export',
  // Disable React's StrictMode if needed
  // reactStrictMode: false,
}

module.exports = nextConfig
