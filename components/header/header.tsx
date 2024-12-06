"use client"
import { cn } from "@/lib/utils"
import { LogOut, Menu } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AsgLogo from "../global/asg-logo"
import AnimatedBackground from "../ui/animated-background"
import { useEffect, useState } from "react"
import { auth } from "@/lib/auth/auth"
import { queryUser } from "@/lib/actions/queries/accounts"
import { Role } from "@prisma/client"

const Header = ({ variant }: { variant: "main" | "login" }) => {
  const user = useSession().data?.user
  console.log(user)
  const logout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/login",
    })
  }
  const pathName = usePathname()

  const TABS = [
    {
      name: "Entdecken",
      link: "/projects",
      current: pathName.toLowerCase().startsWith("/projects"),
    },
    ...((user as any)?.role === Role.STUDENT || (user as any)?.role === Role.VIP
      ? [
          {
            name: "Ausgewählt",
            link: "/projects",
            current: pathName.toLowerCase().startsWith("/PLACEHOLDER"),
          },
        ]
      : []),
    {
      name: "Einstellungen",
      link: "/settings",
      current: pathName.toLowerCase().startsWith("/settings"),
    },
    ...((user as any)?.role === Role.TEACHER ||
    (user as any)?.role === Role.ADMIN
      ? [
          {
            name: "Für Lehrer",
            link: "/teachers",
            current: pathName.toLowerCase().startsWith("/teachers"),
          },
        ]
      : []),
    ...((user as any)?.role === Role.ADMIN
      ? [
          {
            name: "💥 Admin Powers 💥",
            link: "/admin",
            current: pathName.toLowerCase().startsWith("/admin"),
          },
        ]
      : []),
  ]

  return (
    <div
      className={cn(
        "p-6 w-screen flex justify-between items-center pb-4 z-50 relative",
        variant === "main" && "border-b-2 dark:border-b-0 border-slate-100 bg-white dark:bg-background"
      )}
    >
      <div className="z-10 flex gap-16 items-center">
        <AsgLogo />
        <div className="md:flex font-medium hidden flex-row">
          <AnimatedBackground
            defaultValue={TABS.find((tab) => tab.current)?.name || "Projekte"}
            className="rounded-lg bg-slate-100"
            transition={{
              type: "spring",
              bounce: 0.2,
              duration: 0.3,
            }}
            enableHover
          >
            {TABS.map((tab, index) => (
              <Link
                href={tab.link}
                key={index}
                className="px-4 py-1 transition-colors duration-300 flex items-center justify-center"
                data-id={tab.name}
                type="button"
              >
                {tab.name}
              </Link>
            ))}
          </AnimatedBackground>
        </div>
      </div>
      <div className="z-10">
        {variant === "main" && (
          <div className="flex gap-8 items-center">
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
