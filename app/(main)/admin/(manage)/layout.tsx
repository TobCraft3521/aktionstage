import AdminSidebar from "@/components/admin/admin-sidebar"
import Header from "@/components/header/header"
import SettingsSidebar from "@/components/settings/settings-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AnimatePresence } from "motion/react"
import React from "react"

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col h-screen">
      <Header variant="main" />
      <SidebarProvider className="flex flex-1 min-h-0 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 bg-slate-50 rounded-xl ml-0 relative overflow-hidden dark:bg-accent m-2 flex">
          <SidebarTrigger className="absolute top-4 left-4 z-50" />
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default Layout
