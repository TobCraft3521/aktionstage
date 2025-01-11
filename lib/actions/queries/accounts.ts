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
  })
  // never return the password!!!
  return teachers.map((teacher) => {
    return {
      id: teacher.id,
      name: teacher.name,
    }
  })
}

export const queryUser = async () => {
  const id = (await auth())?.user?.id
  if (!id) return null
  const user = await db.account.findUnique({
    where: {
      id,
    },
  })
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    role: user.role,
  }
}

// query whether or not a teacher already has a project on each day of the Aktionstage
export const queryTeacherLoad = async () => {
  // ensure the user is a teacher or admin
  const user = await queryUser()
  if (!user || user.role === Role.STUDENT) return null

  // query teachers projects
  const projects = await db.project.findMany({
    where: {
      teachers: {
        some: {
          id: user.id,
        },
      },
    },
    // only select the day to save bandwidth
    select: {
      day: true,
    },
  })

  // return an object with the days as keys and a boolean as value
  return {
    [Day.MON]: projects.some((project) => project.day === Day.MON),
    [Day.TUE]: projects.some((project) => project.day === Day.TUE),
    [Day.WED]: projects.some((project) => project.day === Day.WED),
  }
}
