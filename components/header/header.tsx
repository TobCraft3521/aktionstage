"use client"
import { cn } from "@/lib/utils"
import { LogOut, Menu } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AsgLogo from "../global/asg-logo"
import styles from "./header.module.css"

const Header = ({ variant }: { variant: "main" | "login" }) => {
  const user = useSession().data?.user
  const router = useRouter()
  const logout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/login",
    })
  }
  return (
    <div
      className={cn(
        "p-6 w-screen flex justify-between items-center pb-4 z-50 relative",
        variant === "main" && "border-b-2 border-slate-100 bg-white"
      )}
    >
      <div className="z-10 flex gap-8 items-center">
        <AsgLogo />
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
            Einstellungen
          </Link>
        </div>
      </div>
      <div className="z-10">
        {variant === "main" && (
          <div className="flex gap-4 items-center">
            {user && (
              <>
                <div className="font-medium hidden md:inline">{user.name}</div>
                <div className="font-medium md:hidden">
                  {user.name?.split(" ")[0]}
                </div>
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
