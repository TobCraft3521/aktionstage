"use server"
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
