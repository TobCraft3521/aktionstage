/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "tobcraft.xyz" },
      { hostname: "aktionstage.asg-passau.de" },
    ],
  },
}

export default nextConfig
