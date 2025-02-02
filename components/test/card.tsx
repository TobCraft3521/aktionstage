"use client"
import { AnimateSharedLayout, LayoutGroup, motion } from "motion/react"
import { useState } from "react"
import "./test.css"
function Card({ value, animationId }: { value: string; animationId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <LayoutGroup>
      {open ? (
        <motion.div
          onClick={() => setOpen(false)}
          className="expanded-card"
          layoutId={animationId}
          style={{ background: value }}
        >
          <motion.h2 className="expanded-card-h" layoutId={animationId + "-h"}>
            Expanded {value}
          </motion.h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate
            aliquam molestiae ratione sint magnam sequi fugiat u llam earum
            distinctio fuga iure, ad odit repudiandae modi est alias ipsum
            aperiam. Culpa?
          </p>
        </motion.div>
      ) : (
        <motion.div
          onClick={() => setOpen(true)}
          className="normal-card"
          layoutId={animationId}
          style={{ background: value }}
        >
          <motion.h1 layoutId={animationId + "-h"}>{value}</motion.h1>
        </motion.div>
      )}
    </LayoutGroup>
  )
}
export default Card
