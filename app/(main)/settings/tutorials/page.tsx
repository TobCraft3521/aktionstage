"use client"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Tutorial } from "@prisma/client"
import {
  queryTutorialComplete,
  setTutorialComplete,
} from "@/lib/actions/queries/tutorials"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"

const TutorialSettings = () => {
  // Dynamically get all the tutorial keys (make sure this doesn't change between renders)
  const tutorials = Object.keys(Tutorial) as Tutorial[]
  const router = useRouter()

  // Initialize the state dynamically for each tutorial (default all to true or false)
  const [tutorialsState, setTutorialsState] = useState<
    Record<Tutorial, boolean>
  >({} as Record<Tutorial, boolean>)

  useEffect(() => {
    const initializeState = async () => {
      const initialState = await Promise.all(
        tutorials.map(async (tutorial) => {
          const isComplete = await queryTutorialComplete(tutorial)
          return { [tutorial]: !isComplete }
        })
      )
      setTutorialsState(Object.assign({}, ...initialState))
    }
    initializeState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggle = async (tutorial: Tutorial) => {
    const currentState = tutorialsState[tutorial]
    // Optimistically update UI
    setTutorialsState((prevState) => ({
      ...prevState,
      [tutorial]: !currentState,
    }))

    try {
      // Call the database update function
      await setTutorialComplete(tutorial, currentState)
      if (tutorial === Tutorial.FEATURES) {
        window.location.href = "/projects"
      }
    } catch (error) {
      // Rollback the UI state if the update fails
      setTutorialsState((prevState) => ({
        ...prevState,
        [tutorial]: currentState,
      }))
    }
  }

  const betterNamesMap: Partial<Record<Tutorial, string>> = {
    [Tutorial.ABOUT]: "Über die Aktionstage",
    [Tutorial.FEATURES]: "Zu den neuen Features",
  }

  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center">
      <div className="absolute top-0 left-0 h-[25vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:bg-none dark:border-zinc-800 dark:bg-[#111015]"></div>
      <motion.div
        layoutId="animate-settings"
        className="relative flex w-full max-w-lg flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm shadow-lg shadow-slate-200 dark:shadow-background dark:border-neutral-800 dark:bg-background md:rounded-xl md:p-10"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Tutorials</h1>
          <p className="text-slate-400 dark:text-neutral-400">
            Hier kannst du alle Tutorials-states wählen und damit z.B. die
            Tutorials (💡) erneut durchklicken. Aus heißt abgeschlossen, an
            heißt Tutorial (erneut) anzeigen.
          </p>
        </div>
        <div className="space-y-3">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial}
              className="flex justify-between items-center font-medium p-4 py-2 rounded-lg bg-slate-100 border border-slate-200 dark:bg-accent dark:border-neutral-800"
            >
              {betterNamesMap[tutorial] || tutorial}
              <Switch
                checked={
                  tutorialsState[tutorial.toUpperCase() as Tutorial] || false
                }
                onCheckedChange={() => handleToggle(tutorial)}
                className=""
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default TutorialSettings
