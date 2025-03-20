"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { CreateProjectSchema } from "@/lib/form-schemas"
import PostHogClient from "@/lib/posthog/posthog"
import { redirect } from "next/navigation"
import { cache } from "react"
import { z } from "zod"
import { serverSideUpload } from "../aws/upload"
import { Prisma } from "@prisma/client"

type FormData = z.infer<typeof CreateProjectSchema>

export const queryProjects = cache(async () => {
  const projects = await db.project.findMany({
    include: {
      participants: {
        where: {
          OR: [{ role: "TEACHER" }, { role: "ADMIN" }],
        },
      },
    },
  })

  return projects
})

export const queryProjectsWithStudentsAndTeachers = async () => {
  const projects = await db.project.findMany({
    include: {
      participants: true,
    },
  })

  return projects
}

export const queryProjectsForAccount = async (accountId: string) => {
  const projects = await db.project.findMany({
    where: {
      participants: {
        some: {
          id: accountId,
        },
      },
    },
  })

  return projects.sort(
    (a, b) =>
      ["MON", "TUE", "WED"].indexOf(a.day) -
      ["MON", "TUE", "WED"].indexOf(b.day)
  )
}

export async function queryInfiniteProjects({
  pageParam: cursor,
}: {
  pageParam: string | undefined
}) {
  const pageSize = 12
  const projects = await db.project.findMany({
    take: pageSize,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: "asc" },
    include: {
      participants: true,
    },
  })

  return {
    items: projects,
    nextCursor:
      projects.length === pageSize
        ? projects[projects.length - 1].id
        : undefined,
  }
}

export const queryTeachersProjects = async () => {
  const id = (await auth())?.user?.id
  const teacher = await db.account.findUnique({
    where: {
      id,
      OR: [{ role: "ADMIN" }, { role: "TEACHER" }],
    },
    include: {
      projects: {
        include: {
          participants: true,
        },
      },
    },
  })
  if (!teacher) return redirect("/login")
  // Order for display
  return teacher.projects.sort(
    (a, b) =>
      ["MON", "TUE", "WED"].indexOf(a.day) -
      ["MON", "TUE", "WED"].indexOf(b.day)
  )
}

export const kickStudent = async (projectId: string, studentId: string) => {
  const id = (await auth())?.user?.id
  if (!id) return redirect("/login")
  const user = await db.account.findUnique({
    where: {
      id,
    },
  })

  if (!user?.role || user.role !== "ADMIN") return redirect("/login")
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      participants: true,
    },
  })
  if (!project) return redirect("/login")
  if (!project.participants.find((p) => p.id === studentId))
    return redirect("/login")
  await db.project.update({
    where: {
      id: projectId,
    },
    data: {
      participants: {
        disconnect: {
          id: studentId,
        },
      },
    },
  })
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
      `/teachers/projects/feedback?msg=Keine Berechtigung&status=error`
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
    return redirect(
      `/teachers/projects/feedback?msg=Bitte fülle alle Felder aus`
    )
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
      `/teachers/projects/feedback?msg=Titel zu lang (max. 32 Zeichen)&status=error`
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
      projects: true,
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
        `/teachers/projects/feedback?msg=Raum nicht gefunden&status=error`
      )
    }
  }

  // Check if teacher already has a project on this day
  const projects = await db.project.findMany({
    where: {
      day: formData.date,
      participants: {
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
      `/teachers/projects/feedback?msg=Bereits ein Projekt an diesem Tag&status=error`
    )
  }

  // custom url / temp img
  const imgUrl =
    typeof formData.banner === "string"
      ? formData.banner
      : // temp img
        "https://static.vecteezy.com/system/resources/thumbnails/008/202/370/original/loading-circle-icon-loading-gif-loading-screen-gif-loading-spinner-gif-loading-animation-loading-free-video.jpg"

  // create project
  // Ignore invalid teachers - only from "teachers" array
  const project = await db.project.create({
    data: {
      name: formData.title,
      description: formData.description,
      imageUrl: imgUrl,
      emoji: formData.emoji,
      day: formData.date,
      time: formData.time,
      maxStudents: formData.maxStudents,
      minGrade: formData.minGrade,
      maxGrade: formData.maxGrade,
      location: formData.location,
      price: formData.price,
      participants: {
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
        `/teachers/projects/feedback?msg=Raum nicht gefunden&status=error`
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
        `/teachers/projects/feedback?msg=Raum wurde in der Zwischenzeit bereits belegt. Projekt: ${
          room.projects.find((p) => p.day === formData.date)?.name
        }
          ". Das Projekt wurde trotzdem erstellt. Bitte bearbeiten.&status=warning`
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

  if (formData.banner instanceof File) {
    // Upload image
    const { error } = await serverSideUpload(formData.banner)
    if (error) {
      posthog.capture({
        event: "create_project_failed",
        properties: {
          reason: "image_upload_failed",
        },
        distinctId: id,
      })
      return redirect(
        `/teachers/projects/feedback?msg=Bild konnte nicht hochgeladen werden, Projekt wurde trotzdem erstellt. Bitte bearbeiten.&status=error`
      )
    }
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
    `/teachers/projects/feedback?msg=Projekt erfolgreich erstellt&status=success`
  )
}

export const queryProject = async (id: string) => {
  const project = await db.project.findUnique({
    where: {
      id,
    },
    include: {
      participants: true,
    },
  })
  return project
}
