"use client"
import Image from "next/image"
import { Button } from "../ui/button"
import AnimatedButton from "../global/some-button"
import "./features.css"
import { useState } from "react"
import {
  finishTutorial,
  setTutorialComplete,
} from "@/lib/actions/queries/tutorials"
import { Tutorial } from "@prisma/client"

const FeatureTutorial = ({ show }: { show: boolean }) => {
  const [showTutorial, setShowTutorial] = useState(show)
  const handleClose = async () => {
    setShowTutorial(false)
    try {
      await finishTutorial(Tutorial.FEATURES)
    } catch (error) {
      setShowTutorial(true)
    }
  }

  return (
    <>
      {showTutorial && (
        <div className="absolute inset-0 flex items-center justify-center z-[100]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black opacity-50 pointer-events-none z-[99]"></div>

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-background shadow-lg rounded-xl p-8 w-[95vw] max-h-[90vh] max-w-3xl mx-auto z-[100] pointer-events-auto">
            <h1 className="text-2xl font-semibold drop-shadow-lg dark:text-foreground">
              Die neue Aktionstage Webseite ist da!
            </h1>
            <p className="text-slate-400 dark:text-zinc-500 mb-8 max-w-lg">
              Entdecke die durch viel Arbeit entstandenen neuen Features und
              Verbesserungen, wie zum Beispiel:
            </p>
            <div className="flex mb-8 flex-col">
              <div className="flex flex-col md:flex-row w-full justify-center gap-4 md:gap-8">
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative md:drop-shadow-lg inline-block">
                  ⚡ Next level UI
                  <Image
                    src="/underline.svg"
                    alt="Underline"
                    width={126}
                    height={14}
                    className="absolute left-[10%] md:left-[25%] top-[85%] md:top-[95%] w-[100px] md:w-[70%]"
                  />
                </span>
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg">
                  🔍 Live Suchen
                </span>
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg">
                  ⏰ Countdown
                </span>
              </div>
              <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 w-full mt-4">
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg">
                  🌴 Flüssiges Gefühl
                </span>
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg">
                  🫅🏻 Features for teachers
                </span>
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg">
                  🌚 Dark Mode
                </span>
              </div>
              <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 w-full md:mt-4">
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg hidden md:block">
                  📦 Behind the scenes
                </span>
                <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 dark:text-foreground relative drop-shadow-lg hidden md:block">
                  🪴 Sicherer (Hacken)
                </span>
              </div>
            </div>
            <AnimatedButton onClick={handleClose}>
              Los geht&apos;s 🔥
            </AnimatedButton>
            <span className="absolute top-4 right-2 text-6xl text-gray-500 drop-shadow-xl">
              <span className="fire">
                <span className="flame base">🔥</span>
                <span className="flame animate">🔥</span>
                <span className="flame animate">🔥</span>
                <span className="flame animate">🔥</span>
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default FeatureTutorial
