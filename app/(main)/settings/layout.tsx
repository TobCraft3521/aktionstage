import { Countdown } from "@/components/global/countdown"
import Header from "@/components/header/header"
import SettingsSidebar from "@/components/settings/settings-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AnimatePresence } from "motion/react"

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <Countdown />
      <Header variant="main" />
      <SidebarProvider className="flex flex-1 min-h-0 overflow-hidden w-screen">
        <SettingsSidebar />
        <div className="flex-1 min-h-0 bg-slate-50 rounded-xl m-2 ml-0 relative overflow-hidden dark:bg-accent">
          <SidebarTrigger className="absolute top-4 left-4 z-50" />
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default SettingsLayout
