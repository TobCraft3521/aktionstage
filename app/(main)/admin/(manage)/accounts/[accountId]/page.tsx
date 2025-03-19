"use client"
import ManageTable from "@/components/admin/data/manage"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  queryAcccountsComplete,
  queryStudents,
  queryTeachers,
} from "@/lib/actions/queries/accounts"
import { queryProjectsForAccount } from "@/lib/actions/queries/projects"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Link2Off } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { motion } from "motion/react"
import ManageAccountActions from "@/components/admin/manage/accounts"

type Props = {
  params: {
    accountId: string
  }
  searchParams: {
    queryKey: string
  }
}

const ManageAccount = ({
  params: { accountId },
  searchParams: { queryKey },
}: Props) => {
  const [activeTab, setActiveTab] = useState(0)
  const queryClient = useQueryClient()
  const user = useSession().data?.user
  const router = useRouter()

  const { data: accounts, isPending } = useQuery({
    queryKey: [queryKey],
    queryFn: async () =>
      queryKey === "students"
        ? await queryStudents()
        : queryKey === "teachers"
        ? await queryTeachers()
        : await queryAcccountsComplete(),
  })

  const account = useMemo(() => {
    return accounts?.find((a) => a.id === accountId)
  }, [accountId, accounts])

  const tabs = [
    {
      title: "Verwalten",
      content: <ManageAccountActions account={account} />,
    },
    {
      title: "Projekte",
      content: (
        <ManageTable
          title="Projekte"
          queryKey="projects"
          queryFn={() => queryProjectsForAccount(accountId)}
          columns={[
            { label: "Name", render: (p) => p.name },
            {
              label: "Aktionen",
              render: (p) => (
                <div className="flex flex-row gap-2">
                  <Button
                    variant="secondary"
                    className="hover:bg-red-500 hover:text-white bg-slate-200"
                    size="sm"
                    onClick={(project) => {}}
                  >
                    <Link2Off size={16} />
                  </Button>
                </div>
              ),
              noPadding: true,
            },
          ]}
          manageItem="projects"
        />
      ),
    },
  ]

  if (user?.role && user.role !== Role.ADMIN)
    // This is just for UX: Everything is back-end protected
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        Halt 🫷🏻🛑! Kleiner Hacker oder ein großer Software Bug 🪳🪲🐛?
        <br />
        Ein {user?.role} hat sich hierher wohl verirrt. Lass {account?.name} in
        Ruhe!
      </div>
    )

  return (
    <div className="relative min-h-0 w-full flex-1 flex flex-col">
      <div className="h-[25vh] w-full flex flex-col pt-16 border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]">
        <div className="w-full max-w-6xl ml-16 2xl:mx-auto space-y-2">
          <Button
            variant="secondary"
            className="h-8"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" /> Zurück
          </Button>
          <motion.h1
            layoutId={`account-h1-${accountId}`}
            className="text-xl font-semibold flex flex-row gap-2 items-center"
          >
            {account?.name ? (
              account?.name || `1`
            ) : (
              <Skeleton className="w-[146px] h-[25px] bg-slate-300" />
            )}
          </motion.h1>
          <p className="text-slate-400">
            Hier kannst du {account?.name} verwalten.
          </p>
        </div>
        <div className="mt-auto flex flex-row gap-4 text-slate-700 w-full max-w-6xl ml-16 2xl:mx-auto">
          {tabs.map((t, i) => (
            <div
              key={i}
              className={cn(
                "pb-1 select-none",
                i === activeTab && "border-b-2 border-slate-500"
              )}
            >
              <div
                className="w-full h-full hover:bg-slate-200 p-1 px-4 rounded-md transition-all cursor-pointer"
                onClick={() => setActiveTab(i)}
              >
                {t.title}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* content */}
      <div className="w-full max-w-6xl px-16 2xl:px-0 2xl:mx-auto flex-1 flex py-8 min-h-0">
        {tabs[activeTab].content}
      </div>
    </div>
  )
}

export default ManageAccount
