"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export const removeTeacherFromProject = async (
  projectId: string,
  teacherId: string
) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id: projectId, participants: { some: { id: user.id } } },
  })
  if (!project) return null
  await db.project.update({
    where: { id: projectId },
    data: { participants: { disconnect: { id: teacherId } } },
  })
}

export const addTeacherToProject = async (
  projectId: string,
  teacherId: string
) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id: projectId, participants: { some: { id: user.id } } },
  })
  if (!project) return null
  await db.project.update({
    where: { id: projectId },
    data: { participants: { connect: { id: teacherId } } },
  })
}

export const leaveProject = async (projectId: string) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id: projectId, participants: { some: { id: user.id } } },
    include: { participants: true },
  })
  if (!project) return null
  // Don't allow the last teacher to leave the project
  const teacherCount = project.participants.filter(
    (participant) =>
      participant.role === Role.TEACHER || participant.role === Role.ADMIN
  ).length
  if (teacherCount === 1) {
    return null
  }
  await db.project.update({
    where: { id: projectId },
    data: { participants: { disconnect: { id: user.id } } },
  })
}
