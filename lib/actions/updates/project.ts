"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { getStartDate } from "@/lib/helpers/start-date"
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

export const leaveProjectAsTeacher = async (projectId: string) => {
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

export const signUpForProject = async (projectId: string) => {
  const user = (await auth())?.user
  if (!user) return { error: true }
  // Check student
  if (user.role !== Role.STUDENT && user.role !== Role.VIP)
    return { error: true }
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { participants: true },
  })
  if (!project) return { error: true }
  // Check if project is full
  const studentsCount = project.participants.filter(
    (participant) =>
      participant.role === Role.STUDENT || participant.role === Role.VIP
  ).length
  if (studentsCount >= (project.maxStudents || 0)) return { error: true }
  // Check if user is already signed up
  const isAlreadySignedUp = project.participants.some(
    (participant) => participant.id === user.id
  )
  if (isAlreadySignedUp) return { error: "Bereits angemeldet" }
  // Check allowed timeframe
  const now = Date.now()
  const { startDate, error } = getStartDate(user.role === Role.VIP)
  if (error || startDate === null) return { error }
  if (now < startDate) return { error: "Abmeldung noch nicht möglich" }
  if (
    !process.env.NEXT_PUBLIC_SIGNUP_END_DATE ||
    parseInt(process.env.NEXT_PUBLIC_SIGNUP_END_DATE) < now
  )
    return { error: "Abmeldung nicht mehr möglich" }
  await db.project.update({
    where: { id: projectId },
    data: { participants: { connect: { id: user.id } } },
  })
  return { error: false }
}

export const leaveProject = async (projectId: string) => {
  const user = (await auth())?.user
  if (!user) return { error: "Kein Benutzer angemeldet" }
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { participants: true },
  })
  if (!project) return { error: "Projekt nicht gefunden" }
  // Check if user is already signed up
  const isAlreadySignedUp = project.participants.some(
    (participant) => participant.id === user.id
  )
  if (!isAlreadySignedUp) return { error: "Nicht angemeldet" }

  // Check allowed timeframe
  const now = Date.now()
  const { startDate, error } = getStartDate(user.role === Role.VIP)
  if (error || startDate === null) return { error }
  if (now < startDate) return { error: "Abmeldung noch nicht möglich" }
  if (
    !process.env.NEXT_PUBLIC_SIGNUP_END_DATE ||
    parseInt(process.env.NEXT_PUBLIC_SIGNUP_END_DATE) < now
  )
    return { error: "Abmeldung nicht mehr möglich" }

  await db.project.update({
    where: { id: projectId },
    data: { participants: { disconnect: { id: user.id } } },
  })
  return { error: false }
}
