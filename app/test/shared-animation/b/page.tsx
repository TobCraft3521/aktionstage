"use client"

import {
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion"
import Image from "next/image"
import { useState } from "react"

interface Card {
  id: number
  title: string
  description: string
}

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const y = useMotionValue(0)
  const scale = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5])

  const cards: Card[] = [
    { id: 1, title: "App 1", description: "Description of App 1" },
    { id: 2, title: "App 2", description: "Description of App 2" },
    { id: 3, title: "App 3", description: "Description of App 3" },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <motion.div layout className="flex flex-col items-center">
        <div className="flex space-x-4">
          {cards.map((card) => (
            <motion.div
              className="p-4 bg-white rounded-lg shadow-lg cursor-pointer w-48 relative"
              key={card.id}
              layoutId={`card-container-${card.id}`}
              onClick={() => setSelectedId(card.id)}
            >
              <motion.h2
                className="text-lg font-semibold inline"
                layoutId={`title-${card.id}`}
              >
                {card.title}
              </motion.h2>
              <motion.p layoutId={`description-${card.id}`}>
                {card.description}
              </motion.p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedId && (
            <motion.div
              className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white rounded-lg shadow-lg z-10"
              layoutId={`card-container-${selectedId}`}
              onClick={() => setSelectedId(null)}
              drag="y"
              style={{ y, scale }}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDrag={(event, info) => {
                if (info.offset.y > 100 || info.offset.y < -100) {
                  setSelectedId(null)
                }
              }}
            >
              <motion.h2
                className="text-lg font-bold"
                layoutId={`title-${selectedId}`}
              >
                {cards.find((card) => card.id === selectedId)?.title}
              </motion.h2>
              <motion.p layoutId={`description-${selectedId}`}>
                {cards.find((card) => card.id === selectedId)?.description}
              </motion.p>
              {/* <Image
                src={"/imgs/asg-logo.jpg"}
                alt={"project-image"}
                layout="fill"
                // objectFit="cover"
                blurDataURL={"/imgs/asg-logo.jpg"}
                quality={100} // Lower quality for better performance
                className="pointer-events-none brightness"
                priority
                placeholder="blur"
              /> */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default App
