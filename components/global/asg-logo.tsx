import Image from "next/image"
import Link from "next/link"
import { Istok_Web } from "next/font/google"
import { cn } from "@/lib/utils"

const istokWeb = Istok_Web({
  display: "swap",
  weight: "700",
  subsets: ["latin"],
})

const AsgLogo = () => {
  return (
    <div className="flex flex-row">
      <Link
        href="/projects"
        className={cn(
          "bg-black/75 rounded-lg z-10 flex items-center gap-2 p-2 pr-4 text-white xs:text-lg cursor-pointer hover:bg-black/90 transition-all",
          istokWeb.className
        )}
      >
        <Image
          src="/imgs/asg-logo.jpg"
          alt="asg-logo"
          width={512}
          height={512}
          className="w-10 h-10 rounded-lg"
        />
        Aktionstage
      </Link>
      {/* squisher */}
      <div className="flex-1"></div>
    </div>
  )
}

export default AsgLogo
