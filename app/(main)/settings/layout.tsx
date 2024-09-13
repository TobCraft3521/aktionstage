import Header from "@/components/header/header"
import SettingsSidebar from "@/components/settings/settings-sidebar"
import { CreditCard, Lock, User, Users } from "lucide-react"
import Link from "next/link"

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header variant="main" />
      <div className="flex flex-1">
        <div className="block">
          <SettingsSidebar />
        </div>
        <div className="flex-1 bg-slate-100 rounded-tl-xl mt-2 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
