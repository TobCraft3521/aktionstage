import styles from "@/components/projects/project/styles.module.css"
import {
  finishTutorial,
  queryTutorialComplete,
} from "@/lib/actions/queries/tutorials"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import useMeasure from "react-use-measure"
import { TransitionPanel } from "../motion-primitives/transition-panel"
import { Button as ShadButton } from "../ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Tutorial } from "@prisma/client"
import toast from "react-hot-toast"

function Button({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="relative flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  )
}

// const AboutTutorial = () => {
//   const [fadeOut, setFadeOut] = useState(false)
//   const finish = async () => {
//     await finishTutorial("ABOUT")
//     setFadeOut(true)
//   }
//   return (
//     <>
//       {/* <AnimatePresence> */}
//       {!fadeOut && (
//         <motion.div
//           // initial={{ opacity: 1 }}
//           // exit={{ opacity: 0, transition: { duration: 0.5 } }}
//           className={cn(
//             "relative p-6 bg-white rounded-3xl shadow-2xl flex flex-col justify-between h-full",
//             styles.loadAni
//           )}
//         >
//           {/* Light Bulb Emoji */}
//           <span
//             className="absolute text-5xl rotate-6"
//             style={{ top: "-10px", right: "-10px" }}
//           >
//             💡
//           </span>

//           {/* Card Content */}
//           <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 drop-shadow-md mb-4">
//             {/* Gradient text highlighter */}
//             Über die
//             <span className="relative inline-block ml-2">
//               <span className="absolute inset-0 -skew-x-3 bg-gradient-to-r from-purple-500 to-pink-500 transform -rotate-1"></span>
//               <span className="relative text-white px-1">Aktionstage</span>
//             </span>
//           </h2>

//           {/* Buttons */}
//           <div className="flex flex-col space-y-2 mt-auto">
//             <Button
//               variant="outline"
//               onClick={finish}
//               className="px-4 py-1.5 h-10 border border-slate-500 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 focus:outline-none focus:ring-slate-500 focus:ring-opacity-50"
//             >
//               Fertig
//             </Button>
//             <Button className="px-4 py-1.5 h-10 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-slate-500 focus:ring-opacity-50 flex items-center justify-center gap-2">
//               Mehr <ArrowRight size={16} />
//             </Button>
//           </div>
//         </motion.div>
//       )}
//       {/* </AnimatePresence> */}
//     </>
//   )
// }

export function AboutTutorial() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [ref, bounds] = useMeasure()
  const queryClient = useQueryClient()

  const FEATURES = [
    {
      description: "Die Aktionstage finden jedes Jahr am ASG statt.",
    },
    {
      description:
        "Dabei kannst du für Montag, Dienstag und Mittwoch Projekte aussuchen.",
    },
    {
      description:
        "Bei begrenzter Teilnehmerzahl gewinnt, wer sich am schnellsten anmeldet.",
    },
  ]

  const { data: done } = useQuery({
    queryKey: ["about-tutorial"],
    queryFn: () => queryTutorialComplete(Tutorial.ABOUT),
  })

  const { mutate: finish } = useMutation({
    mutationFn: () => finishTutorial(Tutorial.ABOUT),
    onMutate: () => {
      queryClient.setQueryData(["about-tutorial"], true)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["about-tutorial"],
      })
    },
    onError: () => {
      toast.error("Fehler beim Beenden des Tutorials")
    },
  })

  const handleSetActiveIndex = (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1)
    setActiveIndex(newIndex)
  }

  useEffect(() => {
    if (activeIndex < 0) setActiveIndex(0)
    if (activeIndex > FEATURES.length) setActiveIndex(FEATURES.length - 1)
  }, [activeIndex, FEATURES.length])

  if (done) return null

  return (
    <motion.div
      className={cn(
        "relative bg-white rounded-3xl shadow-2xl flex flex-col justify-between h-[60vw] sm:h-64",
        styles.loadAni
      )}
    >
      <span
        className="absolute text-5xl rotate-6"
        style={{ top: "-10px", right: "-10px" }}
      >
        💡
      </span>
      <TransitionPanel
        activeIndex={activeIndex}
        variants={{
          enter: (direction) => ({
            x: direction > 0 ? 364 : -364,
            opacity: 0,
            height: bounds.height > 0 ? bounds.height : "auto",
            position: "initial",
          }),
          center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            height: bounds.height > 0 ? bounds.height : "auto",
          },
          exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 364 : -364,
            opacity: 0,
            position: "absolute",
            top: 0,
            width: "100%",
          }),
        }}
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        custom={direction}
        className="h-full overflow-hidden"
      >
        {[{} as any, ...FEATURES].map((feature, index) =>
          index === 0 ? (
            <div
              key={index}
              className="p-6 h-[60vw] sm:h-64 flex flex-col items-center"
              ref={ref}
            >
              {/* Light Bulb Emoji */}
              {/* Card Content */}
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 drop-shadow-md mb-4">
                {/* Gradient text highlighter */}
                Über die
                <span className="relative inline-block ml-2">
                  <span className="absolute inset-0 -skew-x-3 bg-gradient-to-r from-purple-500 to-pink-500 transform -rotate-1"></span>
                  <span className="relative text-white px-1">Aktionstage</span>
                </span>
              </h2>
              {/* Buttons */}
              <div className="flex flex-col space-y-2 mt-auto w-full">
                <ShadButton
                  variant="outline"
                  onClick={() => finish()}
                  className="w-full px-4 py-1.5 h-10 border border-slate-500 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 focus:outline-none focus:ring-slate-500 focus:ring-opacity-50"
                >
                  Fertig
                </ShadButton>
                <ShadButton
                  className="w-full px-4 py-1.5 h-10 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-slate-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                  onClick={() => handleSetActiveIndex(activeIndex + 1)}
                >
                  Mehr <ArrowRight size={16} />
                </ShadButton>
              </div>
            </div>
          ) : (
            <div
              key={index}
              className="p-6 flex flex-col items-center text-center font-semibold"
              ref={ref}
            >
              <p className="text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          )
        )}
      </TransitionPanel>
      {activeIndex > 0 && (
        <div className="flex justify-between p-4">
          <Button onClick={() => handleSetActiveIndex(activeIndex - 1)}>
            Zurück
          </Button>

          <Button
            onClick={() =>
              activeIndex === FEATURES.length
                ? finish()
                : handleSetActiveIndex(activeIndex + 1)
            }
          >
            {activeIndex ===
            FEATURES.length /* + 1 cause initial slide - 1 cause index starts at 0 */
              ? "Fertig"
              : "Weiter"}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
