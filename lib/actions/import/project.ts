"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { ImportedProjects } from "@/lib/types"
import { Role } from "@prisma/client"

export const updateProjects = async (
  projects: ImportedProjects,
  add?: boolean
) => {
  const user = (await auth())?.user
  if (!user) return
  const account = await db.account.findUnique({
    where: { id: user.id },
  })
  if (!account) return
  if (account.role !== Role.ADMIN) return
  let amount = 0
  try {
    // When !add we delete all projects
    if (!add) {
      await db.project.deleteMany({})
    }

    // Add students
    const { count } = await db.project.createMany({
      data: projects.map((a) => ({
        id: a.id,
        name: a.name || "",
        description: a.description || "",
        imageUrl: a.imageUrl || "",
        emoji: a.emoji,
        day: a.day,
        time: a.time,
        location: a.location,
        price: a.price,
        maxStudents: a.maxStudents,
        minGrade: a.minGrade,
        maxGrade: a.maxGrade,
      })),
      skipDuplicates: true,
    })

    amount = count

    for (const project of projects) {
      try {
        await db.project.update({
          where: { id: project.id },
          data: {
            ...(project.participantIds?.length > 0 && {
              participants: {
                connect: project.participantIds.map((id) => ({ id })),
              },
            }),
          },
        })
      } catch (error) {
        // error connecting something
        console.error(error)
      }
    }
  } catch (error) {
    console.error(error)
    return {
      error: true,
      amount,
    }
  }
  return {
    error: undefined,
    amount,
  }
}
