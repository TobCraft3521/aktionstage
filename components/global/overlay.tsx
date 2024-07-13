"use client"
import { motion } from "framer-motion"
const Overlay = ({
  isEnabled,
  onClose,
}: {
  isEnabled: boolean
  onClose: () => void
}) => (
  <motion.div
    initial={false}
    animate={{ opacity: isEnabled ? 1 : 0 }}
    transition={{ duration: 0.2 }}
    style={{ pointerEvents: isEnabled ? "auto" : "none" }}
    className="overlay"
  ></motion.div>
)

export default Overlay
