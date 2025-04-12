"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export const deleteProject = async (projectId: string) => {
  const user = (await auth())?.user
  if (!user) return null
  // Check authorization
  if (user.role !== Role.TEACHER && user.role !== Role.ADMIN) return null
  const project = await db.project.findFirst({
    where: { id: projectId, participants: { some: { id: user.id } } },
  })
  if (!project) return null
  return db.project.delete({ where: { id: projectId } })
}
