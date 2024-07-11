"use server"

import { db } from "@/lib/db"

export const queryProjects = async () => {
  const projects = await db.project.findMany()
  return projects
}
