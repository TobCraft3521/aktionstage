import { Lightbulb, Lock, Moon, User } from "lucide-react"
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

const content = [
  {
    groupName: "Profil",
    items: [
      {
        name: "Passwort",
        icon: <Lock className="h-4 w-4 text-slate-400 dark:text-zinc-400" />,
        link: "/settings/password",
      },
    ],
  },
  {
    groupName: "App",
    items: [
      {
        name: "Thema",
        icon: <Moon className="h-4 w-4 text-slate-400 dark:text-zinc-400" />,
        link: "/settings/theme",
      },
    ],
  },
  {
    groupName: "Mehr",
    items: [
      {
        name: "Tutorials",
        icon: (
          <Lightbulb className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
        ),
        link: "/settings/tutorials",
      },
    ],
  },
]

const SettingsSidebar = () => {
  return (
    // hardcoded: header has 120px height
    <Sidebar className="w-64 border-none top-[120px] absolute h-[calc(100vh-120px)]">
      <SidebarContent className="bg-white dark:bg-background">
        <h1 className="p-12 pb-1 text-xl font-semibold">Einstellungen</h1>
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

export default SettingsSidebar
