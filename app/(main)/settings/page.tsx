import Header from "@/components/header/header"
import SettingsSidebar from "@/components/settings/settings-sidebar"
import { CreditCard, Lock, User, Users } from "lucide-react"
import Link from "next/link"

const Settings = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header variant="main" />
      <div className="flex flex-1">
        <div className="block">
          <SettingsSidebar />
        </div>
        <div className="flex-1 bg-slate-100 rounded-tl-xl mt-2 relative overflow-hidden">
          <div className="absolute top-0 w-full h-64 bg-slate-100 border-b border-slate-200"></div>
        </div>
      </div>
    </div>
  )
}

export default Settings
