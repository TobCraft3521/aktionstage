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
      <div className="flex flex-1 min-h-0">
        <div className="block">
          <AdminSidebar />
        </div>
        <div className="flex flex-1 bg-slate-100 rounded-tl-xl mt-2 relative overflow-hidden min-h-0 flex-col">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Layout
