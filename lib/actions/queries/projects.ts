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
  // ultimative debugger 🤭
  // console.log(`🚀 Creating project:
  // 🔤\tName: ${formData.title}
  // 📝\tDescription: ${formData.description}
  // 🏫\tRoom: ${formData.room || "Not specified"}
  // 🖼️\tBanner: ${formData.banner}
  // 🤭\tEmoji: ${formData.emoji}
  // 🧑🏻‍🏫\tTeachers: ${formData.teachers}
  // 📅\tDate: ${formData.date}
  // 🕒\tTime: ${formData.time}
  // 🫂\tMaxStudents: ${formData.maxStudents}
  // 🎓\tGrades: ${formData.minGrade} - ${formData.maxGrade}
  // 📍\tLocation: ${formData.location}
  // 🫰🏻\tPrice: ${formData.price}
  // `)

  const id = (await auth())?.user?.id
  if (!id) return redirect("/login")
  // check if user is teacher or admin
  const user = await db.account.findUnique({
    where: {
      id,
    },
  })
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN"))
    return {
      error: "Nicht berechtigt",
    }

  // validate form data
  // this could be done using zod [server side] but this is more customisable

  if (
    !formData.title ||
    !formData.description ||
    !formData.banner ||
    !formData.emoji ||
    !formData.date ||
    !formData.time ||
    !formData.maxStudents ||
    !formData.minGrade ||
    !formData.maxGrade ||
    !formData.location ||
    formData.price === undefined
  )
    return {
      error: "Bitte fülle alle Felder aus",
    }

  if (formData.title.length > 32)
    return {
      error: "Titel zu lang",
    }

  // Check if teachers exist
  // Ignore invalid teachers later
  const teachers = await db.account.findMany({
    where: {
      id: {
        in: formData.teachers || [],
      },
      role: "TEACHER",
    },
  })

  // If room is specified, check if it exists
  if (formData.room) {
    const room = await db.room.findUnique({
      where: {
        id: formData.room,
      },
    })
    if (!room)
      return {
        error: "Raum nicht gefunden",
      }
  }

  // Check if teacher already has a project on this day
  const projects = await db.project.findMany({
    where: {
      day: formData.date,
      teachers: {
        some: {
          id: {
            in: formData.teachers,
          },
        },
      },
    },
  })
  if (projects.length > 0)
    return {
      error: "Bereits ein Projekt an diesem Tag",
    }

  // create project
  // Ignore invalid teachers - only from "teachers" array
  const project = await db.project.create({
    data: {
      name: formData.title,
      description: formData.description,
      imageUrl: formData.banner,
      emoji: formData.emoji,
      day: formData.date,
      time: formData.time,
      maxStudents: formData.maxStudents,
      studentsCount: 0,
      minGrade: formData.minGrade,
      maxGrade: formData.maxGrade,
      location: formData.location,
      price: formData.price,
      teachers: {
        connect: teachers.map((teacher) => ({
          id: teacher.id,
        })),
      },
    },
  })

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
    // Just for typescript, already checked above
    if (!room)
      return {
        error: "Raum nicht gefunden",
      }
    if (room.project) {
      // Update project location
      await db.project.update({
        where: {
          id: project.id,
        },
        data: {
          location: `Keine Ahnung`,
        },
      })
      return {
        error:
          "Raum wurde in der Zwischenzeit bereits belegt. Projekt: " +
          room.project.name +
          ". Das Projekt wurde trotzdem erstellt.",
      }
    }
    // Room available
    await db.room.update({
      where: {
        id: formData.room,
      },
      data: {
        project: {
          connect: {
            id: project.id,
          },
        },
      },
    })
    // Update project location
    await db.project.update({
      where: {
        id: project.id,
      },
      data: {
        location: `ASG ${room.name}`,
      },
    })
  }

  // Everything successful
  return {
    error: null,
  }
}
