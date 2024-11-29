import Header from "@/components/header/header"
import SettingsSidebar from "@/components/settings/settings-sidebar"
import TeachersSidebar from "@/components/teachers/teachers-sidebar"
import React from "react"

type Props = {
  children: React.ReactNode
}

const Teachers = ({ children }: Props) => {
  return (
    <div className="flex flex-col h-screen">
      <Header variant="main" />
      <div className="flex flex-1">
        <div className="block">
          <TeachersSidebar />
        </div>
        <div className="flex-1 bg-slate-100 rounded-tl-xl mt-2 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Teachers
