"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { cache } from "react"
import { redirect } from "next/navigation"
import { z } from "zod"
import { CreateProjectSchema } from "@/lib/form-schemas"
import { PostHog } from "posthog-js"
import PostHogClient from "@/lib/posthog/posthog"

type FormData = z.infer<typeof CreateProjectSchema>

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
  //Analytics
  const posthog = PostHogClient()

  // ultimative debugger 🤭
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
  // check if user is teacher or admin
  const user = await db.account.findUnique({
    where: {
      id,
    },
  })

  posthog.capture({
    event: "attempt_create_project",
    properties: {
      title: formData.title,
      description: formData.description,
      banner: formData.banner,
      emoji: formData.emoji,
      teachers: formData.teachers,
      date: formData.date,
      time: formData.time,
      maxStudents: formData.maxStudents,
      minGrade: formData.minGrade,
      maxGrade: formData.maxGrade,
      location: formData.location,
      price: formData.price,
    },
    distinctId: id,
  })
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "no_permission",
      },
      distinctId: id,
    })
    return redirect(
      `/teachers/create/feedback?msg=Keine Berechtigung&status=error`
    )
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
  ) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "missing_fields",
      },
      distinctId: id,
    })
    return redirect(`/teachers/create/feedback?msg=Bitte fülle alle Felder aus`)
  }

  if (formData.title.length > 32) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "title_too_long",
      },
      distinctId: id,
    })
    return redirect(
      `/teachers/create/feedback?msg=Titel zu lang (max. 32 Zeichen)&status=error`
    )
  }

  const otherTeacherIds = formData.teachers || []
  // Check if teachers exist
  // Ignore invalid teachers later
  const teachers = await db.account.findMany({
    where: {
      id: {
        // Add creator to teachers
        in: [...otherTeacherIds, id],
      },
      OR: [{ role: "TEACHER" }, { role: "ADMIN" }],
    },
    select: {
      id: true,
      ownProjects: true,
    },
  })

  // If room is specified, check if it exists
  if (formData.room) {
    const room = await db.room.findUnique({
      where: {
        id: formData.room,
      },
    })
    if (!room) {
      posthog.capture({
        event: "create_project_failed",
        properties: {
          reason: "room_not_found",
        },
        distinctId: id,
      })
      return redirect(
        `/teachers/create/feedback?msg=Raum nicht gefunden&status=error`
      )
    }
  }

  // Check if teacher already has a project on this day
  const projects = await db.project.findMany({
    where: {
      day: formData.date,
      teachers: {
        some: {
          id: {
            in: teachers.map((teacher) => teacher.id),
          },
        },
      },
    },
  })
  if (projects.length > 0) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "teacher_has_project_on_day",
      },
      distinctId: id,
    })
    return redirect(
      `/teachers/create/feedback?msg=Bereits ein Projekt an diesem Tag&status=error`
    )
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
        projects: true,
      },
    })
    // Just for typescript, already checked above
    if (!room)
      return redirect(
        `/teachers/create/feedback?msg=Raum nicht gefunden&status=error`
      )
    if (room.projects.find((p) => p.day === formData.date)) {
      // Update project location
      await db.project.update({
        where: {
          id: project.id,
        },
        data: {
          location: `Keine Ahnung`,
        },
      })
      posthog.capture({
        event: "create_project_warn",
        properties: {
          reason: "room_already_taken",
        },
        distinctId: id,
      })
      return redirect(
        `/teachers/create/feedback?msg=Raum wurde in der Zwischenzeit bereits belegt. Projekt: ${
          room.projects.find((p) => p.day === formData.date)?.name
        }
          ". Das Projekt wurde trotzdem erstellt.&status=warning`
      )
    }
    // Room available
    await db.room.update({
      where: {
        id: formData.room,
      },
      data: {
        projects: {
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
  posthog.capture({
    event: "create_project_success",
    properties: {
      title: formData.title,
      description: formData.description,
      banner: formData.banner,
      emoji: formData.emoji,
      teachers: formData.teachers,
      date: formData.date,
      time: formData.time,
      maxStudents: formData.maxStudents,
      minGrade: formData.minGrade,
      maxGrade: formData.maxGrade,
      location: formData.location,
      price: formData.price,
    },
    distinctId: id,
  })
  return redirect(
    `/teachers/feedback?msg=Projekt erfolgreich erstellt&status=success`
  )
}

export const queryProject = async (id: string) => {
  const project = await db.project.findUnique({
    where: {
      id,
    },
    include: {
      teachers: true,
    },
  })
  return project
}
