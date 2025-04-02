"use client"
import { SlidingNumber } from "@/components/motion-primitives/sliding-number"
import { getTimeLeft } from "@/lib/helpers/time"
import { confetti } from "@tsparticles/confetti"
import { useEffect, useState } from "react"

export function Countdown() {
  const startDate = process.env.NEXT_PUBLIC_SIGNUP_START_DATE
  const endDate = process.env.NEXT_PUBLIC_SIGNUP_END_DATE

  const startTimestamp = parseInt(startDate || "0")
  const endTimestamp = parseInt(endDate || "0")

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(startTimestamp))

  useEffect(() => {
    if (!startTimestamp || !endTimestamp) return

    const syncToNextSecond = () => {
      const now = Date.now()
      if (now >= startTimestamp) {
        // time for ts particles confetti
        const end = Date.now() + 3 * 1000
        const colors = ["#bb0000", "#ffffff"]
        const anotherTimeConfetti = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          })

          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          })

          if (Date.now() < end) {
            requestAnimationFrame(anotherTimeConfetti)
          }
        }
        anotherTimeConfetti()
        return // Stop if the event has ended [no live update for end date (disable button), but backend will handle it]
      }
      setTimeout(() => {
        setTimeLeft(getTimeLeft(startTimestamp))
        syncToNextSecond()
      }, 1000 - (now % 1000))
    }
    if (startTimestamp > Date.now()) syncToNextSecond()
  }, [endTimestamp, startTimestamp])

  if (!startTimestamp || !endTimestamp) return null

  const now = Date.now()
  if (now < startTimestamp) {
    return (
      <div className="z-[50] relative w-full h-8 bg-gradient-to-r from-yellow-300 via-amber-600 to-yellow-300 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2">
        Noch
        <div className="flex items-center gap-0.5 font-mono text-base">
          {/* <SlidingNumber value={timeLeft.days} padStart={true} />
           <span className="">:</span> */}
          <SlidingNumber value={timeLeft.hours} padStart={true} />
          <span className="">:</span>
          <SlidingNumber value={timeLeft.minutes} padStart={true} />
          <span className="">:</span>
          <SlidingNumber value={timeLeft.seconds} padStart={true} />
        </div>
      </div>
    )
  }
  if (now > endTimestamp) {
    return (
      <div className="z-[50] relative w-full h-8 bg-gradient-to-r from-pink-300 via-red-500 to-orange-300 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2">
        Geschlossen 🔒
      </div>
    )
  }

  return (
    <div
      className="z-[50] relative w-full h-8 bg-gradient-to-r from-lime-300 via-teal-500 to-lime-300
 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2"
    >
      Los gehts 🎉
    </div>
  )
}
