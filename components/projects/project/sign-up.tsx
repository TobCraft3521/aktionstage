import { Button } from "@/components/ui/button"
import { ProjectWithParticipants } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useMemo, useState } from "react"
import { confetti } from "@tsparticles/confetti"
import "./particles.css"
import { leaveProject, signUpForProject } from "@/lib/actions/updates/project"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { LogOut } from "lucide-react"
import { queryUser } from "@/lib/actions/queries/accounts"
import { getStudentAvailability } from "@/lib/helpers/availability"
import { lookUpDay } from "@/lib/helpers/lookupname"
import { getTimeLeft } from "@/lib/helpers/time"

type Props = {
  project: Partial<ProjectWithParticipants>
  studentsCount: number
}

const SignUpButton = ({ project, studentsCount }: Props) => {
  const user = useSession().data?.user
  const isStudent = user?.role === "STUDENT" || user?.role === "VIP"

  const startDate = process.env.NEXT_PUBLIC_SIGNUP_START_DATE
  const endDate = process.env.NEXT_PUBLIC_SIGNUP_END_DATE

  const startTimestamp = parseInt(startDate || "0")
  const endTimestamp = parseInt(endDate || "0")

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(startTimestamp))
  const [tempSignedUpHint, setTempSignedUpHint] = useState(false)
  const queryClient = useQueryClient()

  const { data: account } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => queryUser(),
  })

  const isSignedUp = useMemo(() => {
    return project?.participants?.some(
      (participant) => participant.id === user?.id
    )
  }, [project?.participants, user?.id])

  useEffect(() => {
    if (!startTimestamp || !endTimestamp) return

    const syncToNextSecond = () => {
      const now = Date.now()
      setTimeout(() => {
        setTimeLeft(getTimeLeft(startTimestamp))
        syncToNextSecond()
      }, 1000 - (now % 1000))
    }
    if (startTimestamp > Date.now()) syncToNextSecond()
  }, [endTimestamp, startTimestamp])

  const displayTime = () => {
    const { days, hours, minutes, seconds } = timeLeft
    if (days > 0) return `${days} Tag${days > 1 ? "e" : ""}`
    if (hours > 0) return `${hours} Stunde${hours > 1 ? "n" : ""}`
    if (minutes > 0) return `${minutes} Minute${minutes > 1 ? "n" : ""}`
    return `${seconds} Sekunde${seconds > 1 ? "n" : ""}`
  }

  const { mutate: signOut } = useMutation({
    mutationFn: async () => {
      const { error } = await leaveProject(project.id || "")
      if (error) throw new Error(error + "" || "Fehler beim Abmelden")
    },
    onMutate: () => {
      // Optimistically remove the participant from the project [paginated data]
      if (queryClient.getQueryData(["infinite-projects"])) {
        queryClient.setQueryData(
          ["infinite-projects"],
          (oldData: {
            pages: {
              items: ProjectWithParticipants[]
            }[]
          }) => {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => {
                return {
                  ...page,
                  items: page.items.map((project: ProjectWithParticipants) => {
                    if (project.id === project.id) {
                      return {
                        ...project,
                        participants: project.participants?.filter(
                          (participant) => participant.id !== user?.id
                        ),
                      }
                    }
                    return project
                  }),
                }
              }),
            }
          }
        )
      }
      if (queryClient.getQueryData(["chosen-projects"])) {
        // Remove from chosen projects list
        queryClient.setQueryData(
          ["chosen-projects"],
          (oldData: ProjectWithParticipants[]) => {
            return oldData.filter((p) => p.id !== project.id)
          }
        )
      }
      queryClient.setQueryData(["account", user?.id], (oldData: any) => {
        return {
          ...oldData,
          projects: oldData.projects.filter(
            (p: ProjectWithParticipants) => p.id !== project.id
          ),
        }
      })
    },
    onSettled: () => {
      // Refetch the projects after signing out
      queryClient.invalidateQueries({ queryKey: ["infinite-projects"] })
      queryClient.invalidateQueries({ queryKey: ["account", user?.id] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { mutate: signUp } = useMutation({
    mutationFn: async () => {
      const { error } = await signUpForProject(project.id || "")
      if (error) throw new Error(error + "" || "Fehler beim Anmelden")
    },
    onMutate: () => {
      // Optimistically append the new participant to the project [paginated data]
      if (queryClient.getQueryData(["infinite-projects"])) {
        queryClient.setQueryData(
          ["infinite-projects"],
          (oldData: {
            pages: {
              items: ProjectWithParticipants[]
            }[]
          }) => {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => {
                return {
                  ...page,
                  items: page.items.map((project: ProjectWithParticipants) => {
                    if (project.id === project.id) {
                      return {
                        ...project,
                        participants: [
                          ...(project.participants || []),
                          { id: user?.id, name: user?.name, role: user?.role },
                        ],
                      }
                    }
                    return project
                  }),
                }
              }),
            }
          }
        )
      }
      if (queryClient.getQueryData(["chosen-projects"])) {
        // Append to chosen projects list
        queryClient.setQueryData(
          ["chosen-projects"],
          (oldData: ProjectWithParticipants[]) => {
            return [...oldData, project]
          }
        )
      }
      setTempSignedUpHint(true)
      confetti({
        angle: 45,
        spread: 45,
        origin: { x: 0, y: 0.9 },
        particleCount: 100,
      })
      setTimeout(() => {
        setTempSignedUpHint(false)
      }, 1000)
      queryClient.setQueryData(["account", user?.id], (oldData: any) => {
        return {
          ...oldData,
          projects: [
            ...(oldData.projects || []),
            { id: project.id, name: project.name, day: project.day },
          ],
        }
      })
    },
    onSettled: () => {
      // Refetch the projects after signing up
      queryClient.invalidateQueries({ queryKey: ["infinite-projects"] })
      queryClient.invalidateQueries({ queryKey: ["chosen-projects"] })
      queryClient.invalidateQueries({ queryKey: ["account", user?.id] })
    },
    onError: (error) => {
      toast.error(error.message)
      setTempSignedUpHint(false)
    },
  })

  const studentAvailableOnDay =
    project.day && getStudentAvailability(account)[project.day]

  const blockingProject = useMemo(() => {
    return account?.projects.find((p) => p.day === project.day)
  }, [account?.projects, project.day])

  const now = Date.now()
  // If you want to test the confetti effect
  // useEffect(() => {
  //   const end = Date.now() + 3 * 1000
  //   const colors = ["#bb0000", "#ffffff"]
  //   const anotherTimeConfetti = () => {
  //     confetti({
  //       particleCount: 2,
  //       angle: 60,
  //       spread: 55,
  //       origin: { x: 0 },
  //       colors: colors,
  //     })

  //     confetti({
  //       particleCount: 2,
  //       angle: 120,
  //       spread: 55,
  //       origin: { x: 1 },
  //       colors: colors,
  //     })

  //     if (Date.now() < end) {
  //       requestAnimationFrame(anotherTimeConfetti)
  //     }
  //   }
  //   anotherTimeConfetti()
  // }, [])

  if (tempSignedUpHint) {
    return (
      <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
        🎉🎉🎉
      </Button>
    )
  }

  if (now < startTimestamp) {
    return (
      <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
        Noch {displayTime()}
      </Button>
    )
  }

  if (now > endTimestamp) {
    return (
      <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
        🔒 Geschlossen
      </Button>
    )
  }

  if (isSignedUp) {
    return (
      <Button
        className="w-full sm:w-[154px] h-[43px] rounded-xl flex flex-row items-center justify-center gap-2 bg-red-800"
        variant="destructive"
        onClick={() => signOut()}
      >
        Abmelden <LogOut size={16} />
      </Button>
    )
  }

  if (!isStudent) return null

  if (!studentAvailableOnDay)
    return (
      <Button className="w-full sm:w-auto h-[43px] rounded-xl" disabled>
        Du hast {blockingProject?.name} am{" "}
        {project.day && lookUpDay[project.day]}{" "}
        {!blockingProject && "ein anderes Projekt"}
      </Button>
    )

  return (
    <>
      {(studentsCount || 0) < (project.maxStudents || 0) ? (
        <Button
          className="w-full sm:w-[154px] h-[43px] rounded-xl"
          onClick={() => signUp()}
        >
          Anmelden
        </Button>
      ) : (
        <Button className="w-full sm:w-[154px] h-[43px] rounded-xl" disabled>
          Voll 😭
        </Button>
      )}
    </>
  )
}

export default SignUpButton
