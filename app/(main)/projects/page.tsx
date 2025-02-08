"use client"
import posthog from "posthog-js"
import { useEffect } from "react"

const Projects = () => {
  useEffect(() => {
    posthog.capture("projects_page_viewed")
  }, [])
  return null
}

export default Projects
