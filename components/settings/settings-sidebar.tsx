import { CreditCard, Lock, User, Users } from "lucide-react"
import Link from "next/link"

const SettingsSidebar = () => {
  return (
    <div className="h-full w-[260px] border-zinc-300 dark:border-zinc-800 dark:bg-[#111015]">
      <h1 className="p-12 pb-1 text-xl font-semibold">Einstellungen</h1>
      <h2 className="mt-4 w-full px-12 text-sm font-semibold">Profil</h2>
      <div className="flex w-full flex-col items-center p-2 text-sm font-medium ">
        <Link
          href={"/dashboard/" + "organizationId" + "/settings/account"}
          className="flex w-44 flex-row items-center gap-2 rounded-md p-2 text-sm text-slate-400 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <User className="h-4 w-4 text-slate-400 dark:text-zinc-400" /> Account
        </Link>

        <Link
          href={"/dashboard/" + "organizationId" + "/settings/security"}
          className="flex w-44 flex-row items-center gap-2 rounded-md p-2 text-sm text-slate-400 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Lock className="h-4 w-4 text-slate-400 dark:text-zinc-400" />{" "}
          Passwort
        </Link>
      </div>
      <h2 className="mt-4 w-full px-12 text-sm font-semibold">Team</h2>
      <div className="flex w-full flex-col items-center p-2 text-sm font-medium ">
        <Link
          href={"/dashboard/" + "organizationId" + "/settings/team"}
          className="flex w-44 flex-row items-center gap-2 rounded-md p-2 text-sm text-slate-400 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Users className="h-4 w-4 text-slate-400 dark:text-zinc-400" /> Team
        </Link>
      </div>
      <h2 className="mt-4 w-full px-12 text-sm font-semibold">Organization</h2>
      <div className="flex w-full flex-col items-center p-2 text-sm font-medium ">
        <Link
          href={"/dashboard/" + "organizationId" + "/settings/billing"}
          className="flex w-44 flex-row items-center gap-2 rounded-md p-2 text-sm text-slate-400 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <CreditCard className="h-4 w-4 text-slate-400 dark:text-zinc-400" />{" "}
          Billing
        </Link>
      </div>
    </div>
  )
}

export default SettingsSidebar