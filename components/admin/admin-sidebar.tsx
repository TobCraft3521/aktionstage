import { GanttChart, LucideLayers } from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"
import { group } from "console"

const content = [
  {
    groupName: "Management",
    items: [
      {
        name: "Übersicht",
        icon: (
          <LucideLayers className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
        ),
        link: "/admin",
      },
    ],
  },
]

const AdminSidebar = () => {
  return (
    <Sidebar className="w-64 border-none top-[88px] absolute h-[calc(100vh-120px)]">
      <SidebarContent className="bg-white dark:bg-background">
        <h1 className="p-12 pb-1 text-xl font-semibold">Admin Portal</h1>
        {content.map((group) => (
          <SidebarGroup key={group.groupName} className="p-0">
            <SidebarGroupLabel className="mt-4 w-full px-12 text-sm font-semibold">
              {group.groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex w-full flex-col items-center text-sm font-medium">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name} className="w-44">
                    <SidebarMenuButton asChild className="w-44">
                      <a
                        href={item.link}
                        className="flex w-44 flex-row items-center gap-2 rounded-md text-sm text-slate-400 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        {item.icon} {item.name}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

export default AdminSidebar
