"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import AsgLogo from "./asg-logo"

const Footer = () => {
  const profile = useSession().data?.user
  return (
    <footer className="w-full min-h-[500px] bg-slate-50 border-slate-100 border-t-2 pt-16">
      <div className="flex justify-center w-full">
        <div className="flex flex-wrap gap-4">
          <div className="w-screen md:w-[35vw] p-8 items-center md:items-start flex flex-col">
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
          <div className="w-screen md:w-[20vw] p-8 text-sm flex items-center md:items-start flex-col">
            <h1 className="font-extrabold mb-1">Interessant</h1>
            {profile ? (
              <p className="" onClick={() => signOut()}>
                Logout
              </p>
            ) : (
              <Link href="/">Login</Link>
            )}
            <Link href="/projects">Home</Link>
            <Link href="https://asg-passau.de">Adalbert-Stifter-G.</Link>
            <Link href="/my-projects">Meine Projekte</Link>
          </div>
          <div className="w-screen md:w-[20vw] p-8 text-sm flex items-center md:items-start flex-col">
            <h1 className="font-extrabold mb-1">Langweilig</h1>
            <Link href="https://asg-passau.de/extras/impressum/">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
