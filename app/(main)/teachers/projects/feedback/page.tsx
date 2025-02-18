"use client"
import { Button } from "@/components/ui/button" // Assuming the Button component is here
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { confetti } from "@tsparticles/confetti"
import "./styles.css"

interface FeedbackPageProps {
  searchParams: { [key: string]: string | undefined }
}

export default function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const status = searchParams.status || "info" // Default to "info" if not provided
  const message = searchParams.msg || "No message provided."

  const styles: Record<string, { text: string; emoji: string }> = {
    success: {
      text: "text-green-500",
      emoji: "✅",
    },
    error: {
      text: "text-red-500",
      emoji: "❌",
    },
    warning: {
      text: "text-yellow-500",
      emoji: "⚠️",
    },
    info: {
      text: "text-blue-500",
      emoji: "ℹ️",
    },
  }

  useEffect(() => {
    if (!(status === "success")) return
    const end = Date.now() + 500
    const colors = ["#40ff00", "#caff38"]
    setTimeout(async function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 75,
        origin: { x: 0.1 },
        colors: colors,
      })

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 75,
        origin: { x: 0.9 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      } else {
      }
    }, 200)
  }, [])

  const currentStyle = styles[status] || styles.info

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
      {/* Content Wrapper */}
      <div className="w-full max-w-3xl text-center drop-shadow-xl">
        <div className={`text-4xl ${currentStyle.text} mb-4`}>
          {currentStyle.emoji}
        </div>
        <h1
          className={`text-2xl font-semibold tracking-tight ${currentStyle.text} mb-2`}
        >
          {message}
        </h1>

        <div className="mt-6">
          <Link href={`/teachers/`}>
            <Button
              variant="default"
              className={`flex items-center justify-center gap-2 mx-auto`}
            >
              Fertig <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
