"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Project } from "@prisma/client"

export const updateProject = async (id: string, data: Partial<Project>) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id, teachers: { some: { id: user.id } } },
  })
  if (!project) return null
  return db.project.update({ where: { id }, data })
}

export const removeTeacherFromProject = async (
  projectId: string,
  teacherId: string
) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id: projectId, teachers: { some: { id: user.id } } },
  })
  if (!project) return null
  await db.project.update({
    where: { id: projectId },
    data: { teachers: { disconnect: { id: teacherId } } },
  })
}

export const addTeacherToProject = async (
  projectId: string,
  teacherId: string
) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id: projectId, teachers: { some: { id: user.id } } },
  })
  if (!project) return null
  await db.project.update({
    where: { id: projectId },
    data: { teachers: { connect: { id: teacherId } } },
  })
}

export const leaveProject = async (projectId: string) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findUnique({
    where: { id: projectId, teachers: { some: { id: user.id } } },
    include: { teachers: true },
  })
  if (!project) return null
  // Don't allow the last teacher to leave the project
  if (project.teachers.length === 1) {
    return null
  }
  await db.project.update({
    where: { id: projectId },
    data: { teachers: { disconnect: { id: user.id } } },
  })
}
