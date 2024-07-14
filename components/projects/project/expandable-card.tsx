"use client"
import { cn } from "@/lib/utils"
import {
  LayoutGroup,
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion"
import Image from "next/image"
import { useRef, useState } from "react"
import styles from "./styles.module.css"
import { Project } from "@prisma/client"
import Overlay from "@/components/global/overlay"
import { useAppState } from "@/hooks/use-app-state"
import { useWheelScroll } from "@/lib/utils/use-wheel-scroll"
import { useScrollConstraints } from "@/lib/utils/use-scroll-constraints"
import { closeSpring, openSpring } from "@/lib/utils/animations"
import { useInvertedBorderRadius } from "@/lib/utils/use-inverted-border-radius"
const dismissDistance = 75
export const ExpandableCard = ({
  animationId,
  i,
  project,
  isSelected,
}: {
  animationId: string
  i: number
  project: Partial<Project>
  isSelected: boolean
}) => {
  const y = useMotionValue(0)
  const scale = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5])
  return (
    
  )
}
