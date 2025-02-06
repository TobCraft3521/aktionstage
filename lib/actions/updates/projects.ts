"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Project } from "@prisma/client"

export const updateProject = async (id: string, data: Partial<Project>) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findFirst({
    where: { id },
    include: { teachers: true },
  })
  if (!project) return null
  if (!project.teachers.some((teacher) => teacher.id === user.id)) return null
  return db.project.update({ where: { id }, data })
}

export const removeTeacherFromProject = async (
  projectId: string,
  teacherId: string
) => {
  const user = (await auth())?.user
  if (!user) return null
  const project = await db.project.findFirst({
    where: { id: projectId },
    include: { teachers: true },
  })
  if (!project) return null
  if (!project.teachers.some((teacher) => teacher.id === user.id)) return null
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
  const project = await db.project.findFirst({
    where: { id: projectId },
    include: { teachers: true },
  })
  if (!project) return null
  if (!project.teachers.some((teacher) => teacher.id === user.id)) return null
  await db.project.update({
    where: { id: projectId },
    data: { teachers: { connect: { id: teacherId } } },
  })
}
