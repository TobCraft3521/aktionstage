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
  return teachers
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
    grade: user.grade,
  }
}

// bulk query the teacher load for all teachers, for the teacher select, to front end show who is available
export const queryAllTeacherLoads = async () => {
  // performance optimized query
  const projects = await db.project.findMany({
    select: {
      day: true,
      teachers: {
        select: {
          id: true,
        },
      },
    },
  })

  // create a map with the teacher ids as keys and the days as values
  const teacherDays = projects.reduce((acc, project) => {
    project.teachers.forEach((teacher) => {
      if (!acc[teacher.id]) acc[teacher.id] = []
      acc[teacher.id].push(project.day)
    })
    return acc
  }, {} as Record<string, Day[]>)

  return teacherDays
}

export const queryProjectStudents = async (projectId: string) => {
  const id = (await auth())?.user?.id
  if (!id) return null
  const project = await db.project.findUnique({
    where: {
      id: projectId,
      teachers: {
        some: {
          id,
        },
      },
    },
    include: {
      students: true,
    },
  })
  if (!project) return null
  return project.students.map((student) => {
    return {
      id: student.id,
      name: student.name,
      grade: student.grade,
    }
  })
}

export const queryStudents = async () => {
  const students = await db.account.findMany({
    where: {
      role: Role.STUDENT,
    },
  })
  return students
}
