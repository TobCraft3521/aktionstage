"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { cache } from "react"
import { FormData } from "@/app/test/multi-step-form/page"
import { redirect } from "next/navigation"

export const queryProjects = cache(async () => {
  const projects = await db.project.findMany({
    include: {
      teachers: true,
    },
  })
  return projects
})

export const queryOwnProjects = async () => {
  const id = (await auth())?.user?.id
  const ownProjects = await db.account.findUnique({
    where: {
      id,
      OR: [{ role: "ADMIN" }, { role: "TEACHER" }],
    },
    include: {
      ownProjects: {
        include: {
          teachers: true,
        },
      },
    },
  })
  if (!ownProjects) return []
  return ownProjects.ownProjects
}

export const createProject = async (formData: FormData & { room?: string }) => {
  console.log(`🚀 Creating project:
  🔤\tName: ${formData.title}
  📝\tDescription: ${formData.description}
  🏫\tRoom: ${formData.room || "Not specified"}
  🖼️\tBanner: ${formData.banner}
  🤭\tEmoji: ${formData.emoji}
  🧑🏻‍🏫\tTeachers: ${formData.teachers}
  📅\tDate: ${formData.date}
  🕒\tTime: ${formData.time}
  🫂\tMaxStudents: ${formData.maxStudents}
  🎓\tGrades: ${formData.minGrade} - ${formData.maxGrade}
  📍\tLocation: ${formData.location}
  🫰🏻\tPrice: ${formData.price}
  `)

  const id = (await auth())?.user?.id
  if (!id) return redirect("/login")
    

  // check room request
  if (formData.room) {
    const room = await db.room.findUnique({
      where: {
        id: formData.room,
      },
      include: {
        project: true,
      },
    })
    if (!room)
      return {
        error: "Raum nicht gefunden",
      }
    if (room.project)
      return {
        error:
          "Raum wurde in der Zwischenzeit bereits belegt. Projekt: " +
          room.project.name,
      }
    // Room available
  }
}
