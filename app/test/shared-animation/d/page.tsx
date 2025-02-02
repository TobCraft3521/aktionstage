// app/page.tsx
"use client"

import { motion } from "motion/react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const goToSubroute = () => {
    router.push("/test/shared-animation/d/big-card")
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <motion.div
        layoutId="card"
        className="bg-blue-500 p-8 rounded-xl shadow-xl"
        style={{ width: "200px", height: "200px" }}
      >
        <h1 className="text-white text-xl font-semibold">Small Card</h1>
      </motion.div>
      <button
        onClick={goToSubroute}
        className="mt-8 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Go to Larger Card
      </button>
    </div>
  )
}
