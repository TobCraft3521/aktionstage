"use client"
import { SlidingNumber } from "@/components/motion-primitives/sliding-number"
import { getStartDate } from "@/lib/helpers/start-date"
import { getTimeLeft } from "@/lib/helpers/time"
import { Role } from "@prisma/client"
import { confetti } from "@tsparticles/confetti"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function Countdown() {
  const user = useSession().data?.user
  const { startDate, error, vipEarlyAccess, defaultStart } = getStartDate(
    user?.role === Role.VIP
  )
  const endDate = parseInt(process.env.NEXT_PUBLIC_SIGNUP_END_DATE || "0")

  const [timeLeft, setTimeLeft] = useState(
    startDate
      ? getTimeLeft(startDate)
      : { days: -1, hours: 0, minutes: 0, seconds: 0 }
  )

  const [defaultStartTimeLeft, setDefaultStartTimeLeft] = useState(
    defaultStart
      ? getTimeLeft(defaultStart)
      : { days: -1, hours: 0, minutes: 0, seconds: 0 }
  )

  useEffect(() => {
    if (!startDate || !endDate) return

    const syncToNextSecond = () => {
      const now = Date.now()
      if (now >= startDate) {
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
        return // Important: stop only call anotherTimeConfetti() once avoid infinite loop
      }
      setTimeout(() => {
        setTimeLeft(getTimeLeft(startDate))
        syncToNextSecond()
      }, 1000 - (now % 1000))
    }
    if (startDate > Date.now() && user) syncToNextSecond()
  }, [endDate, startDate, user])

  useEffect(() => {
    if (!defaultStart) return

    const syncToNextSecond = () => {
      const now = Date.now()
      setTimeout(() => {
        setDefaultStartTimeLeft(getTimeLeft(defaultStart))
        syncToNextSecond()
      }, 1000 - (now % 1000))
    }
    if (defaultStart > Date.now() && user) syncToNextSecond()
  }, [defaultStart, user])

  if (!startDate || !endDate) return null

  const now = Date.now()

  if (error) return error
  if (timeLeft.days === -1) return null

  if (!user) return <div className="h-8"></div>

  if (vipEarlyAccess)
    return (
      <div className="z-[50] relative w-full h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2">
        VIP EARLY ACCESS 🎉
        {/* Visual Cue for Others Still Waiting */}
        <div className="relative flex items-center gap-0.5 font-mono text-base bg-transparent p-1 rounded-lg">
          {/* Centered Strikethrough */}
          <div className="absolute left-0 w-full top-[50%] border-t-2 border-l-2 border-slate-500 opacity-80 z-[60]"></div>

          <SlidingNumber value={defaultStartTimeLeft.hours} padStart={true} />
          <span>:</span>
          <SlidingNumber value={defaultStartTimeLeft.minutes} padStart={true} />
          <span>:</span>
          <SlidingNumber value={defaultStartTimeLeft.seconds} padStart={true} />
        </div>
      </div>
    )

  // If 1 day+ is left, show the countdown in days
  if (timeLeft.days >= 1) {
    return (
      <div className="z-[50] relative w-full h-8 bg-gradient-to-r from-yellow-300 via-amber-600 to-yellow-300 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2">
        Noch {timeLeft.days} Tage
      </div>
    )
  }

  if (now < startDate) {
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
  if (now > endDate) {
    return (
      <div className="z-[50] relative w-full h-8 bg-gradient-to-r from-pink-300 via-red-500 to-orange-300 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2">
        Geschlossen 🔒
      </div>
    )
  }

  return (
    <div className="z-[50] relative w-full h-8 bg-gradient-to-r from-lime-400 to-green-500 flex flex-row justify-center items-center font-semibold text-sm text-white gap-2">
      Los gehts 🎉
    </div>
  )
}
