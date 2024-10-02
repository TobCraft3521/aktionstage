import styles from "@/components/projects/project/styles.module.css"
import { finishTutorial } from "@/lib/actions/queries/tutorials"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
const AboutTutorial = () => {
  const [fadeOut, setFadeOut] = useState(false)
  const finish = async () => {
    await finishTutorial("ABOUT")
    setFadeOut(true)
  }
  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className={cn(
            "relative p-6 bg-white rounded-3xl shadow-2xl flex flex-col justify-between h-full",
            styles.loadAni
          )}
        >
          {/* Light Bulb Emoji */}
          <span
            className="absolute text-5xl"
            style={{ top: "-20px", right: "-20px" }}
          >
            💡
          </span>

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
          <div className="flex flex-col space-y-2 mt-auto">
            <button
              onClick={finish}
              className="px-4 py-1.5 border border-slate-500 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
            >
              Fertig
            </button>
            <button className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50">
              Mehr
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AboutTutorial
