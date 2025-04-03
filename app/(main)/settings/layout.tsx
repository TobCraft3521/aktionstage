import { Countdown } from "@/components/global/countdown"
import Header from "@/components/header/header"
import SettingsSidebar from "@/components/settings/settings-sidebar"
import { CreditCard, Lock, User, Users } from "lucide-react"
import { AnimatePresence } from "motion/react"
import Link from "next/link"

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <Countdown />
      <Header variant="main" />
      <div className="flex flex-1">
        <div className="block">
          <SettingsSidebar />
        </div>
        <div className="flex-1 bg-slate-50 rounded-xl m-2 ml-0 relative overflow-hidden">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
