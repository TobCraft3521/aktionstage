import AdminSidebar from "@/components/admin/admin-sidebar"
import Header from "@/components/header/header"
import { AnimatePresence } from "motion/react"
import React from "react"

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col h-screen">
      <Header variant="main" />
      <div className="flex flex-1 min-h-0 m-2">
        <AdminSidebar />
        <div className="flex flex-1 bg-slate-50 relative min-h-0 rounded-xl overflow-hidden flex-col dark:bg-accent">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Layout
