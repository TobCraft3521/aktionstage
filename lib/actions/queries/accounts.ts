"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export const queryTeachers = async () => {
  const teachers = await db.account.findMany({
    where: {
      role: Role.TEACHER,
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
