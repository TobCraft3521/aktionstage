"use client"
import { ModeToggle } from "@/components/global/theme-toggle"
import React from "react"
import { motion } from "motion/react"

type Props = {}

const ThemePage = (props: Props) => {
  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center">
      <div className="absolute top-0 left-0 h-[25vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]"></div>
      <motion.div
        layoutId="animate-settings"
        className="relative flex w-full max-w-lg flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm shadow-lg shadow-slate-200 dark:border-gray-800 dark:bg-card md:rounded-xl md:p-10"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Thema</h1>
          <p className="text-slate-400">
            Wähle zwischen dark mode und light mode. Team 🌞 oder 🌚?
          </p>
        </div>
        <ModeToggle />
      </motion.div>
    </div>
  )
}

export default ThemePage
