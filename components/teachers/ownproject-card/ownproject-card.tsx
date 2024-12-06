import { cn } from "@/lib/utils"
import { ChevronRight, Plus } from "lucide-react"
import { DM_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

type Props = {
  imageUrl: string
  title: string
  teachers: string
}

const OwnProjectCard = ({ imageUrl, title, teachers }: Props) => {
  return (
    <div className="relative w-56 h-[128px] overflow-hidden rounded-lg shadow-lg cursor-pointer group">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover group-hover:brightness-75 transition-all"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent" />
      <div className={cn("absolute top-4 left-4 text-white font-semibold z-10")}>
        {title}
        <p className="text-sm font-bold text-white/90">with {teachers}</p>
      </div>
    </div>
  )
}

export default OwnProjectCard
