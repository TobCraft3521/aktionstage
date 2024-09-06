"use server"

import { db } from "@/lib/db"
import { cache } from "react"

export const queryProjects = cache(async () => {
  const projects = await db.project.findMany({
    include: {
      teachers: true,
    },
  })
  return projects
})