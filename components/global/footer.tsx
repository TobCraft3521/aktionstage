"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import AsgLogo from "./asg-logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { useRouter } from "next/navigation"

const Footer = () => {
  const profile = useSession().data?.user
  // const router = useRouter()
  return (
    <footer className="w-full min-h-[500px] bg-slate-50 border-slate-100 border-t-2 pt-16 pb-16">
      <div className="flex justify-center w-full">
        <div className="flex flex-wrap gap-4">
          <div className="w-screen md:w-[30vw] p-8 items-center md:items-start flex flex-col">
            <AsgLogo />
            <div className="mt-4 text-sm">
              Offizielle Aktionstage Webseite des
              <br /> Adalbert-Stifter-Gymnasiums Passau
              <br />
              <Link href="https://asg-passau.de" className="underline">
                asg-passau.de
              </Link>
            </div>
            <Link
              href="https://tobcraft.xyz"
              className="p-2 rounded-md bg-slate-200 mt-4 text-sm"
            >
              Made with ❤️ by <span className="underline">Tobias</span>
            </Link>
          </div>
          <div className="w-screen md:w-[15vw] p-8 text-sm flex items-center md:items-start flex-col">
            <h1 className="font-extrabold mb-1">Interessant</h1>
            {profile ? (
              <p
                className=""
                onClick={() => {
                  signOut({
                    redirect: true,
                    callbackUrl: "/login",
                  })
                }}
              >
                Logout
              </p>
            ) : (
              <Link href="/">Login</Link>
            )}
            <Link href="/projects">Home</Link>
            <Link href="https://asg-passau.de">Adalbert-Stifter-G.</Link>
            <Link href="/my-projects">Meine Projekte</Link>
          </div>
          <div className="w-screen md:w-[15vw] p-8 text-sm flex items-center md:items-start flex-col">
            <h1 className="font-extrabold mb-1">Langweilig</h1>
            <Link href="https://asg-passau.de/extras/impressum/">
              Impressum
            </Link>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>Support</TooltipTrigger>
                <TooltipContent>What about Lehrer fragen? 💁🏻‍♂️</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-screen md:w-[15vw] p-8 text-sm flex items-center md:items-start flex-col">
            <h1 className="font-extrabold mb-1">Am Besten</h1>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Link href="https://github.com/tobcraft3521/aktionstage">
                    Github Repo
                  </Link>
                </TooltipTrigger>
                <TooltipContent>star 🥹⭐</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Link
              href="https://insigh.to/b/asg-aktionstage"
              className="group hover:text-red-500 relative"
            >
              Feedback{" "}
              <span className="group-hover:animate-ping absolute -right-6">
                ❤️
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
