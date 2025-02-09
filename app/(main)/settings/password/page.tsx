import ChangePasswordForm from "@/components/settings/change-password-form"
import React from "react"

const Password = () => {
  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center">
      <div className="absolute top-0 h-[30vh] w-full border-b border-zinc-300 bg-[#EDEDF3] dark:border-zinc-800 dark:bg-card"></div>
      <div className="relative flex w-full max-w-lg flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm shadow-lg shadow-slate-200 dark:border-gray-800 dark:bg-card md:rounded-xl md:p-10">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Passwort ändern</h1>
          <p className="text-slate-400">
            Hier kannst du dein Passwort ändern. Bitte wähle ein sicheres
            Passwort. 🔒
          </p>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  )
}

export default Password
