"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"

export const deleteProject = async (projectId: string) => {
  const userId = (await auth())?.user.id
  if (!userId) return null
  const project = await db.project.findFirst({
    where: { id: projectId, teachers: { some: { id: userId } } },
  })
  if (!project) return null
  return db.project.delete({ where: { id: projectId } })
}
