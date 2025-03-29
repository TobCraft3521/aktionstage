import { Button } from "@/components/ui/button"
import { ProjectWithParticipants } from "@/lib/types"
import { useMutation } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { confetti } from "@tsparticles/confetti"
import "./particles.css"
import { signUpForProject } from "@/lib/actions/updates/project"
import { useSession } from "next-auth/react"

type Props = {
  project: Partial<ProjectWithParticipants>
  studentsCount: number
}

// Optimized version of getTimeLeft
export function getTimeLeft(targetTimestamp: number) {
  const now = Date.now()
  let delta = Math.max(0, targetTimestamp - now)

  const days = Math.floor(delta / 86_400_000) // 1000 * 60 * 60 * 24
  delta -= days * 86_400_000

  const hours = Math.floor(delta / 3_600_000) // 1000 * 60 * 60
  delta -= hours * 3_600_000

  const minutes = Math.floor(delta / 60_000) // 1000 * 60
  delta -= minutes * 60_000

  const seconds = Math.floor(delta / 1000)

  return { days, hours, minutes, seconds }
}

const SignUpButton = ({ project, studentsCount }: Props) => {
  const { mutateAsync: signUp } = useMutation({
    mutationFn: async () => {
      const { error } = await signUpForProject(project.id || "")
      if (error) throw new Error("Error signing up for project")
    },
  })

  const user = useSession().data?.user
  const isStudent = user?.role === "STUDENT" || user?.role === "VIP"

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
        const end = Date.now() + 5 * 1000
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

  const displayTime = () => {
    const { days, hours, minutes, seconds } = timeLeft
    if (days > 0) return `${days} Tag${days > 1 ? "e" : ""}`
    if (hours > 0) return `${hours} Stunde${hours > 1 ? "n" : ""}`
    if (minutes > 0) return `${minutes} Minute${minutes > 1 ? "n" : ""}`
    return `${seconds} Sekunde${seconds > 1 ? "n" : ""}`
  }

  const now = Date.now()

  if (now < startTimestamp) {
    return (
      <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
        Noch {displayTime()}
      </Button>
    )
  }

  if (now > endTimestamp) {
    return (
      <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
        🔒 Geschlossen
      </Button>
    )
  }

  if (!isStudent) return null

  return (
    <>
      {(studentsCount || 0) < (project.maxStudents || 0) ? (
        <Button
          className="w-full sm:w-[154px] h-[43px] rounded-xl"
          onClick={() => signUp()}
        >
          Anmelden
        </Button>
      ) : (
        <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
          Voll 😭
        </Button>
      )}
    </>
  )
}

export default SignUpButton
