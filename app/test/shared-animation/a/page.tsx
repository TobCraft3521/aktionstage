"use client"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
const Page = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const items = [
    { id: 0, title: "First", subtitle: "First subtitle" },
    { id: 1, title: "Second", subtitle: "Second subtitle" },
    { id: 2, title: "Third", subtitle: "Third subtitle" },
  ]

  return (
    <>
      {items.map((item, index) => (
        <motion.div
          key={index}
          layoutId={item.id + ""}
          onClick={() => setSelectedId(item.id)}
        >
          <motion.h5>{item.subtitle}</motion.h5>
          <motion.h2>{item.title}</motion.h2>
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedId && (
          <motion.div layoutId={selectedId + ""} className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-white">
            <motion.h5>{items[selectedId].subtitle}</motion.h5>
            <motion.h2>{items[selectedId].title}</motion.h2>
            <motion.button onClick={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Page
