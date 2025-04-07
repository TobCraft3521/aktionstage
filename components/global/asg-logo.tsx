import Image from "next/image"
import Link from "next/link"
import { DM_Sans } from "next/font/google"
import { cn } from "@/lib/utils"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const AsgLogo = () => {
  return (
    <div className="flex flex-row">
      <Link
        href="/projects"
        className={cn(
          "bg-slate-800 dark:bg-black rounded-lg z-10 flex items-center gap-2 p-2 pr-4 text-white xs:text-lg cursor-pointer hover:bg-black/90 transition-all",
          dmSans.className
        )}
      >
        <Image
          src="/imgs/asg-logo.jpg"
          alt="asg-logo"
          width={512}
          height={512}
          className="w-8 h-8 rounded-lg"
        />
        Aktionstage
      </Link>
      {/* squisher */}
      <div className="flex-1"></div>
    </div>
  )
}

export default AsgLogo
