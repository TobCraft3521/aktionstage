/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "tobcraft.xyz" },
      { hostname: "aktionstage.asg-passau.de" },
      { hostname: "images.pexels.com" },
      { hostname: "asg-images.s3.eu-central-1.amazonaws.com" },
    ],
  },
}

export default nextConfig
