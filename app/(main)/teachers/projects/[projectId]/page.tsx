"use client"
import { useParams } from "next/navigation"
import { motion } from "motion/react"
import { cache, useEffect, useState } from "react"
import { Project } from "@prisma/client"
import { queryProject } from "@/lib/actions/queries/projects"
import { useTeacherProjectStore } from "@/stores/teacher-project-store"

const ProjectDetailView = () => {
  const { projectId: id } = useParams() // Get the project ID from the URL
  const { projects: ownProjects, fetchProjects } = useTeacherProjectStore()
  useEffect(() => {
    if (!ownProjects) fetchProjects()
  }, [ownProjects, fetchProjects])
  const projectFilter = cache(() => ownProjects?.find((p) => p.id === id))
  const project = projectFilter()
  console.log(ownProjects, project)
  return (
    <div className="absolute w-full h-full left-0 top-0 bg-slate-50">
      <motion.h1 layoutId={`title-${id}`} className="text-3xl font-bold mt-4">
        {project?.name}
      </motion.h1>
    </div>
  )
}

export default ProjectDetailView
