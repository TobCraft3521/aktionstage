"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { deleteAccount, resetPassword } from "@/lib/actions/queries/accounts"
import { assignAccount, queryProjects } from "@/lib/actions/queries/projects"
import { AccountWithProjects, ProjectWithParticipants } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useConfirmModal } from "@/stores/confirm-modal"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronsUpDown,
  FolderOpen,
  LucideRefreshCcw,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"

type Props = {
  account?: AccountWithProjects
}

const ManageAccountActions: React.FC<Props> = ({ account }) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false)
  const { openConfirmModal } = useConfirmModal()
  const queryClient = useQueryClient()

  const { data: projects, isPending } = useQuery({
    queryKey: ["projects"],
    queryFn: () => queryProjects(),
  })

  const projectsCount = useMemo(() => {
    return projects?.filter((p) =>
      p.participants?.some((p) => p.id === account?.id)
    ).length
  }, [account?.id, projects])

  const resetPasswordFn = async () => {
    setIsResettingPassword(true)
    if (!account?.id) return
    const { error } = await resetPassword(account?.id)
    setIsResettingPassword(false)
    if (error) {
      toast.error("Fehler beim Zurücksetzen des Passworts")
    } else {
      toast.success("Passwort zurückgesetzt")
    }
  }

  const { mutateAsync: deleteAccountFn } = useMutation({
    mutationFn: () => deleteAccount(account?.id || ""),
    onSuccess: () => {
      toast.success("Account gelöscht", {
        id: "delete-account",
      })
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Accounts", {
        id: "delete-account",
      })
      router.push(`/admin/accounts/${account?.id}`)
    },
    onMutate: () => {
      router.push("/admin")
      toast.loading("Account wird gelöscht", {
        id: "delete-account",
      })
    },
  })

  const { mutateAsync: assignAccountFn } = useMutation({
    mutationFn: async (projectId: string) => {
      if (!account?.id) return
      if (!projectId) return
      toast.loading("Projekt wird zugewiesen", {
        id: "assign-project",
      })
      const { error } = await assignAccount(projectId, account.id)
      return { error }
    },
    onMutate: (projectId: string) => {
      queryClient.setQueryData(
        ["projects"],
        (old: ProjectWithParticipants[]) => {
          return old.map((project) => {
            if (project.id === projectId) {
              console.log(account)
              return {
                ...project,
                participants: [...(project.participants || []), account],
              }
            }
            return project
          })
        }
      )
    },
    onSuccess: () => {
      toast.success("Projekt zugewiesen", {
        id: "assign-project",
      })
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      })
    },
    onError: () => {
      toast.error("Fehler beim Zuweisen des Projekts", {
        id: "assign-project",
      })
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-2">
        <Popover open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
          <PopoverTrigger asChild className="w-full">
            <Button
              role="combobox"
              className="w-[250px] md:w-full justify-between bg-slate-200 dark:bg-foreground hover:bg-slate-300 border text-gray-900 border-slate-300 border-none"
            >
              Projekte zuweißen
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" side="top">
            {isPending ? (
              <div className="p-8">
                Wow bist du schnell, die Projekte laden noch...
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Projekte suchen" />
                <CommandEmpty>Keine Projekte gefunden</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {projects?.map((project) => (
                      <CommandItem
                        key={project.id}
                        className={cn("cursor-pointer")}
                        value={project.name}
                        onSelect={() => assignAccountFn(project.id)}
                        disabled={project.participants?.some(
                          (p) => p.id === account?.id
                        )}
                      >
                        {project.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            )}
          </PopoverContent>
        </Popover>
        <Button
          className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300"
          variant="secondary"
          onClick={() =>
            openConfirmModal({
              message: "Passwort wirklich zurücksetzen?",
              confirmCallback: resetPasswordFn,
              title: "Passwort zurücksetzen",
            })
          }
        >
          <LucideRefreshCcw
            size={16}
            className={cn(
              isResettingPassword && "animate-spin direction-reverse"
            )}
          />
          Password Reset
        </Button>
        <Button
          className="flex items-center gap-2"
          variant="destructive"
          onClick={() =>
            account?.id &&
            openConfirmModal({
              message: "Account wirklich löschen?",
              confirmCallback: deleteAccountFn,
              title: "Account löschen",
            })
          }
        >
          <Trash2 size={16} />
          Löschen
        </Button>
      </div>
      <div className="">
        <div className="bg-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 w-36">
          <div className="text-3xl font-extrabold text-slate-800">{projectsCount}</div>
          <Separator className="bg-slate-300 w-full" />
          <div className="text-sm text-slate-600 font-medium">Projekte</div>
        </div>
      </div>
    </div>
  )
}

export default ManageAccountActions
