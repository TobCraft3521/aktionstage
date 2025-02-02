// app/subroute/page.tsx
"use client"

import { motion } from "motion/react"
import { useRouter } from "next/navigation"

export default function SubroutePage() {
  const router = useRouter()

  const goBack = () => {
    router.push("/test/shared-animation/d")
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <motion.div
        layoutId="card"
        className="bg-green-500 p-8 rounded-xl shadow-xl"
        style={{ width: "400px", height: "400px" }}
      >
        <h1 className="text-white text-xl font-semibold">Larger Card</h1>
      </motion.div>
      <button
        onClick={goBack}
        className="mt-8 bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Go Back to Small Card
      </button>
    </div>
  )
}
