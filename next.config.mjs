/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      //allow all domains
      {
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
