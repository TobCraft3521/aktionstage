"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Day, Role } from "@prisma/client"

export const queryTeachers = async () => {
  const teachers = await db.account.findMany({
    where: {
      OR: [
        {
          role: Role.TEACHER,
        },
        {
          role: Role.ADMIN,
        },
      ],
    },
    include: {
      projects: true,
    },
  })
  return teachers
}

export const queryUser = async () => {
  const id = (await auth())?.user?.id
  if (!id) return
  const user = await db.account.findUnique({
    where: {
      id,
    },
    include: {
      projects: true,
    },
  })
  if (!user) return
  return user
}

// bulk query the teacher load for all teachers, for the teacher select, to front end show who is available
export const queryAllTeacherLoads = async () => {
  // performance optimized query
  const projects = await db.project.findMany({
    select: {
      day: true,
      participants: {
        where: {
          OR: [
            {
              role: Role.TEACHER,
            },
            {
              role: Role.ADMIN,
            },
          ],
        },
        select: {
          id: true,
        },
      },
    },
  })

  // create a map with the teacher ids as keys and the days as values
  const teacherDays = projects.reduce((acc, project) => {
    project.participants?.forEach((teacher) => {
      if (!acc[teacher.id]) acc[teacher.id] = []
      acc[teacher.id].push(project.day)
    })
    return acc
  }, {} as Record<string, Day[]>)

  return teacherDays
}

export const queryProjectParticipants = async (projectId: string) => {
  const id = (await auth())?.user?.id
  if (!id) return null
  const project = await db.project.findUnique({
    where: {
      id: projectId,
      participants: {
        some: {
          id,
        },
      },
    },
    include: {
      participants: true,
    },
  })
  if (!project) return null
  return project.participants
}

export const queryStudents = async () => {
  const students = await db.account.findMany({
    where: {
      OR: [
        {
          role: Role.STUDENT,
        },
        {
          role: Role.VIP,
        },
      ],
    },
    include: {
      projects: true,
    },
  })
  return students
}

export const queryProjectStudents = async (projectId: string) => {
  const students = await db.account.findMany({
    where: {
      projects: {
        some: {
          id: projectId,
        },
      },
      OR: [
        {
          role: Role.STUDENT,
        },
        {
          role: Role.VIP,
        },
      ],
    },
  })
  return students
}

export const queryStudentsWithProjects = async () => {
  const students = await db.account.findMany({
    where: {
      OR: [
        {
          role: Role.STUDENT,
        },
        {
          role: Role.VIP,
        },
      ],
    },
    include: {
      projects: true,
    },
  })
  return students
}

export const queryTeachersWithProjectsAndPasswords = async () => {
  const teachers = await db.account.findMany({
    where: {
      OR: [
        {
          role: Role.TEACHER,
        },
        {
          role: Role.ADMIN,
        },
      ],
    },
    include: {
      projects: true,
      authDetails: true,
    },
  })
  return teachers
}

export const queryAcccountsComplete = async () => {
  const user = (await auth())?.user
  if (!user) return
  if (user.role !== Role.ADMIN) return
  const accounts = await db.account.findMany({
    include: {
      projects: true,
      authDetails: true,
    },
  })
  return accounts
}

export const queryAccount = async (id: string) => {
  const account = await db.account.findUnique({
    where: {
      id,
    },
    include: {
      projects: true,
      authDetails: true,
    },
  })
  return account
}

export const resetPassword = async (accountId: string) => {
  const user = (await auth())?.user
  if (!user) return { error: true }
  const account = await db.account.findUnique({
    where: { id: user.id },
  })
  if (!account) return { error: true }
  if (account.role !== Role.ADMIN) return { error: true }
  try {
    const { initialPassword } = (await db.authDetails.findUnique({
      where: { accountId },
    })) as any
    if (!initialPassword) return { error: true }
    await db.authDetails.update({
      where: { accountId },
      data: {
        password: initialPassword,
      },
    })
  } catch (error) {
    console.error(error)
    return { error: true }
  }
  return { error: undefined }
}

export const deleteAccount = async (accountId: string) => {
  const user = (await auth())?.user
  if (!user) return { error: true }
  const account = await db.account.findUnique({
    where: { id: user.id },
  })
  if (!account) return { error: true }
  if (account.role !== Role.ADMIN) return { error: true }
  try {
    await db.account.delete({
      where: { id: accountId },
    })
  } catch (error) {
    console.error(error)
    return { error: true }
  }
  return { error: undefined }
}
