"use client"
import { lookUpDay } from "@/lib/helpers/lookupname"
import { cn } from "@/lib/utils"
import { Day } from "@prisma/client"
import { motion } from "motion/react"
import { DM_Sans } from "next/font/google"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cache } from "react"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

type Props = {
  imageUrl: string
  title: string
  teachers: string
  day: string
  id: string
}

const OwnProjectCard = ({ imageUrl, title, teachers, day, id }: Props) => {
  const router = useRouter()

  router.prefetch(`/teachers/projects/${id}`)

  const formattedDay = lookUpDay[day as Day]
  return (
    <div
      className="relative w-56 h-[128px] overflow-hidden rounded-lg shadow-lg cursor-pointer group"
      onClick={() => {
        router.push(`/teachers/projects/${id}`)
      }}
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover group-hover:brightness-75 transition-all"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/10" />
      <motion.h1
        className={cn(
          "absolute top-4 left-4 right-4 text-white font-semibold z-10 drop-shadow-lg"
        )}
        layoutId={`title-${id}`}
      >
        {title}
        {teachers ? (
          <p className="text-sm font-bold text-white/90">
            mit {teachers}, am {formattedDay}
          </p>
        ) : (
          <p className="text-sm font-bold text-white/90">
            alleine, am {formattedDay}
          </p>
        )}
      </motion.h1>
    </div>
  )
}

export default OwnProjectCard
