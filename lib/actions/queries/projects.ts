"use server"

import { auth } from "@/lib/auth/auth"
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

export const queryOwnProjects = async () => {
  const id = (await auth())?.user?.id
  const ownProjects = await db.account.findUnique({
    where: {
      id,
      OR: [{ role: "ADMIN" }, { role: "TEACHER" }],
    },
    include: {
      ownProjects: {
        include: {
          teachers: true,
        },
      },
    },
  })
  if (!ownProjects) return []
  return ownProjects.ownProjects
}
