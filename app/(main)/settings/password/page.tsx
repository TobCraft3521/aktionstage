"use client"
import ChangePasswordForm from "@/components/settings/change-password-form"
import React from "react"
import { motion } from "motion/react"

const Password = () => {
  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center">
      <div className="absolute top-0 left-0 h-[25vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:bg-none dark:border-zinc-800 dark:bg-background"></div>
      <motion.div
        layoutId="animate-settings"
        className="relative flex w-full max-w-lg flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm shadow-lg shadow-slate-200 dark:shadow-background dark:border-neutral-800 dark:bg-background md:rounded-xl md:p-10"
      >
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Passwort ändern</h1>
          <p className="text-slate-400 dark:text-neutral-400">
            Hier kannst du dein Passwort ändern. Bitte wähle ein sicheres
            Passwort. 🔒
          </p>
        </div>
        <ChangePasswordForm />
      </motion.div>
    </div>
  )
}

export default Password
