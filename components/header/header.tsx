"use client"
import { LogOut, Menu } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import styles from "./header.module.css"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const Header = ({ variant }: { variant: "main" | "login" }) => {
  const user = useSession().data?.user
  const router = useRouter()
  const logout = () => {
    signOut()
    router.push("/login")
  }
  return (
    <div
      className={cn(
        "p-6 w-screen flex justify-between items-center pb-4 z-50 relative",
        variant === "main" && "border-b-2 border-slate-100 bg-white"
      )}
    >
      <div className="z-10 flex gap-8 items-center">
        <Link
          href="/projects"
          className="bg-black/75 rounded-lg z-10 flex items-center gap-2 p-2 text-white xs:text-lg font-semibold cursor-pointer hover:bg-black/90 transition-all"
        >
          <Image
            src="/imgs/asg-logo.jpg"
            alt="asg-logo"
            width={512}
            height={512}
            className="w-12 h-12 rounded-lg"
          />
          Aktionstage
        </Link>
        <div className="md:flex items-center justify-center gap-4 font-medium hidden">
          <Link
            href="/projects"
            className={cn(
              "flex cursor-pointer hover:bg-slate-100 transition-all gap-4 items-center p-2 rounded-lg",
              styles.link
            )}
          >
            Projekte
          </Link>
          <Link
            href="/projects"
            className={cn(
              "flex cursor-pointer hover:bg-slate-100 transition-all gap-4 items-center p-2 rounded-lg",
              styles.link
            )}
          >
            Meine Projekte
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex cursor-pointer hover:bg-slate-100 transition-all gap-4 items-center p-2 rounded-lg",
              styles.link
            )}
          >
            Passwort ändern
          </Link>
        </div>
      </div>
      <div className="z-10">
        {variant === "main" && (
          <div className="flex gap-4 items-center">
            {user && (
              <>
                <div className="font-medium hidden md:inline">
                  {user.name}
                </div>
                <div className="font-medium md:hidden">{user.name?.split(" ")[0]}</div>
                <div
                  onClick={logout}
                  className="flex cursor-pointer hover:bg-slate-100 transition-all gap-4 font-medium items-center px-2 border border-slate-200 p-1 rounded-lg"
                >
                  <p className="hidden md:block">Abmelden</p>
                  <LogOut size={20} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="z-10 md:hidden">
        <Menu size={24} />
      </div>
    </div>
  )
}

export default Header
