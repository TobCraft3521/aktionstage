"use client"
import { cn } from "@/lib/utils"
import { ChevronRight, LogOut, Menu } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AsgLogo from "../global/asg-logo"
import AnimatedBackground from "../ui/animated-background"
import { useEffect, useState } from "react"
import { auth } from "@/lib/auth/auth"
import { queryUser } from "@/lib/actions/queries/accounts"
import { Role } from "@prisma/client"
import posthog from "posthog-js"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { Button } from "../ui/button"

const Header = ({ variant }: { variant: "main" | "login" }) => {
  const user = useSession().data?.user
  const logout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/login",
    })
    posthog.reset()
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
            link: "/chosen",
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
        variant === "main" &&
          "border-b dark:border-b-0 border-slate-200 bg-white dark:bg-background"
      )}
    >
      <div className="z-10 flex gap-16 items-center">
        <AsgLogo />
        <div className="xl:flex font-medium hidden flex-row">
          <AnimatedBackground
            defaultValue={TABS.find((tab) => tab.current)?.name || "Projekte"}
            className="rounded-lg bg-slate-100 dark:bg-neutral-800"
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
                className="px-4 py-1 transition-colors duration-300 flex items-center justify-center dark:text-primary"
                data-id={tab.name}
                type="button"
              >
                {tab.name}
              </Link>
            ))}
          </AnimatedBackground>
        </div>
      </div>
      <div className="z-10 flex flex-row items-center md:gap-8">
        {variant === "main" && (
          <div className="flex gap-2 md:gap-8 items-center">
            {user && (
              <>
                <div className="font-medium hidden md:flex gap-2 dark:text-foreground">
                  {user.name}
                  {user.role === Role.VIP && (
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-0.5 px-2 text-xs text-white font-extrabold flex items-center">
                      👑 VIP
                    </span>
                  )}
                </div>
                <div className="font-medium md:hidden">
                  {user.name?.split(" ")[0]}
                </div>
                <div
                  onClick={logout}
                  className="flex cursor-pointer hover:bg-slate-100 transition-all gap-4 font-medium items-center px-2 border border-slate-200 p-1 rounded-lg dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <p className="hidden md:block">Abmelden</p>
                  <LogOut size={20} />
                </div>
              </>
            )}
          </div>
        )}
        <div className="z-10 xl:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-zinc-400"
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[280px] bg-slate-50/90 backdrop-blur-[2px] border-0 dark:bg-background" // Frosted glass effect
            >
              {/* Header with subtle underline */}
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-border">
                <h2 className="text-lg font-semibold text-slate-800 tracking-tight dark:text-foreground">
                  Menu
                </h2>
              </div>

              {/* Navigation Links - flat with tonal contrast */}
              <nav className="flex flex-col px-2 py-3">
                {TABS.map((tab, index) => (
                  <Link
                    href={tab.link}
                    key={index}
                    className="px-4 py-3 mx-1 rounded-md
                  text-slate-700 font-normal
                   bg-slate-50/0 hover:bg-slate-100/50
                   transition-colors duration-200 dark:text-foreground dark:hover:bg-accent"
                  >
                    <span className="relative pl-3">
                      <span
                        className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 
                      bg-slate-300/50 rounded-full dark:bg-border"
                      ></span>
                      {tab.name}
                    </span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

export default Header
