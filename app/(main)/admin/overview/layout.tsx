import AdminSidebar from "@/components/admin/admin-sidebar"
import Header from "@/components/header/header"
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
      <SidebarProvider className="flex flex-1 min-h-0 overflow-hidden w-[100vw]">
        <AdminSidebar />
        <div className="flex flex-1 bg-slate-50 rounded-xl m-2 relative dark:bg-accent min-h-0 overflow-hidden">
          <SidebarTrigger className="absolute top-4 left-4 z-50" />
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default Layout
