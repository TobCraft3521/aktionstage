import { serverSideUpload } from "@/lib/actions/aws/upload"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { CreateProjectSchema } from "@/lib/form-schemas"
import PostHogClient from "@/lib/posthog/posthog"

export const POST = async (request: Request) => {
  //Analytics
  const posthog = PostHogClient()

  // Auth
  const id = (await auth())?.user?.id
  if (!id) return Response.json({ redirectUrl: "/login" })

  const formData = await request.formData() // Read FormData
  const sessionTracker = formData.get("sessionTracker") as string

  // Convert FormData to a plain object
  const rawData: Record<string, any> = {}
  formData.forEach((value, key) => {
    rawData[key] = value
  })

  // convert strings to numbers and teachers to array
  rawData.teachers = rawData.teachers ? rawData.teachers.split(",") : []
  rawData.price = parseFloat(rawData.price)
  rawData.maxStudents = parseInt(rawData.maxStudents)
  rawData.minGrade = parseInt(rawData.minGrade)
  rawData.maxGrade = parseInt(rawData.maxGrade)

  // ultimative debugger 🤭
  console.log(`🚀 Creating project:
    🔤\tName: ${rawData.title}
    📝\tDescription: ${rawData.description}
    🏫\tRoom: ${rawData.room || "Not specified"}
    🖼️\tBanner: ${rawData.banner}
    🤭\tEmoji: ${rawData.emoji}
    🧑🏻‍🏫\tTeachers: ${rawData.teachers}
    📅\tDate: ${rawData.date}
    🕒\tTime: ${rawData.time}
    🫂\tMaxStudents: ${rawData.maxStudents}
    🎓\tGrades: ${rawData.minGrade} - ${rawData.maxGrade}
    📍\tLocation: ${rawData.location}
    🫰🏻\tPrice: ${rawData.price}
    `)

  // Validate & transform data using Zod
  const {
    success,
    data: parsedData,
    // error,
  } = CreateProjectSchema.safeParse(rawData)
  const data = {
    ...parsedData,
    room: rawData.room || undefined,
  }

  // console.log(error) // Debug

  if (!success) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "invalid_data",
      },
      distinctId: id,
    })
    return Response.json({
      redirectUrl:
        "/teachers/projects/feedback?msg=Ungültige Daten&status=error",
    })
  }

  // check if user is teacher or admin
  const user = await db.account.findUnique({
    where: {
      id,
    },
  })

  posthog.capture({
    event: "attempt_create_project",
    properties: {
      title: data.title,
      description: data.description,
      banner: data.banner,
      emoji: data.emoji,
      teachers: data.teachers,
      date: data.date,
      time: data.time,
      maxStudents: data.maxStudents,
      minGrade: data.minGrade,
      maxGrade: data.maxGrade,
      location: data.location,
      price: data.price,
      sessionTracker,
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
    return Response.json({
      redirectUrl: `/teachers/projects/feedback?msg=Keine Berechtigung&status=error`,
    })
  }

  // validate form data
  // this could be done using zod [server side] but this is more customisable

  if (
    !data.title ||
    !data.description ||
    !data.banner ||
    !data.emoji ||
    !data.date ||
    !data.time ||
    !data.maxStudents ||
    !data.minGrade ||
    !data.maxGrade ||
    !data.location ||
    data.price === undefined
  ) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "missing_fields",
      },
      distinctId: id,
    })
    return Response.json({
      redirectUrl: `/teachers/projects/feedback?msg=Bitte fülle alle Felder aus`,
    })
  }

  if (data.title.length > 32) {
    posthog.capture({
      event: "create_project_failed",
      properties: {
        reason: "title_too_long",
      },
      distinctId: id,
    })
    return Response.json({
      redirectUrl: `/teachers/projects/feedback?msg=Titel zu lang (max. 32 Zeichen)&status=error`,
    })
  }

  const otherTeacherIds = data.teachers || []
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
  if (data.room) {
    const room = await db.room.findUnique({
      where: {
        id: data.room,
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
      return Response.json({
        redirectUrl: `/teachers/projects/feedback?msg=Raum nicht gefunden&status=error`,
      })
    }
  }

  // Check if teacher already has a project on this day
  const projects = await db.project.findMany({
    where: {
      day: data.date,
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
    return Response.json({
      redirectUrl: `/teachers/projects/feedback?msg=Bereits ein Projekt an diesem Tag&status=error`,
    })
  }

  // custom url / temp img
  const imgUrl =
    typeof data.banner === "string"
      ? data.banner
      : // temp img
        "https://static.vecteezy.com/system/resources/thumbnails/008/202/370/original/loading-circle-icon-loading-gif-loading-screen-gif-loading-spinner-gif-loading-animation-loading-free-video.jpg"

  // create project
  // Ignore invalid teachers - only from "teachers" array
  const project = await db.project.create({
    data: {
      name: data.title,
      description: data.description,
      imageUrl: imgUrl,
      emoji: data.emoji,
      day: data.date,
      time: data.time,
      maxStudents: data.maxStudents,
      studentsCount: 0,
      minGrade: data.minGrade,
      maxGrade: data.maxGrade,
      location: data.location,
      price: data.price,
      teachers: {
        connect: teachers.map((teacher) => ({
          id: teacher.id,
        })),
      },
    },
  })

  // check room request
  if (data.room) {
    const room = await db.room.findUnique({
      where: {
        id: data.room,
      },
      include: {
        projects: true,
      },
    })
    // Just for typescript, already checked above
    if (!room)
      return Response.json({
        redirectUrl: `/teachers/projects/feedback?msg=Raum nicht gefunden&status=error`,
      })
    if (room.projects.find((p) => p.day === data.date)) {
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
      return Response.json({
        redirectUrl: `/teachers/projects/feedback?msg=Raum wurde in der Zwischenzeit bereits belegt. Projekt: ${
          room.projects.find((p) => p.day === data.date)?.name
        }
            ". Das Projekt wurde trotzdem erstellt. Bitte bearbeiten.&status=warning`,
      })
    }
    // Room available
    await db.room.update({
      where: {
        id: data.room,
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

  if (data.banner instanceof File) {
    // Upload image
    const { error, publicUrl } = await serverSideUpload(data.banner)
    if (error) {
      posthog.capture({
        event: "create_project_failed",
        properties: {
          reason: "image_upload_failed",
        },
        distinctId: id,
      })
      return Response.json({
        redirectUrl: `/teachers/projects/feedback?msg=Bild konnte nicht hochgeladen werden, Projekt wurde trotzdem erstellt. Bitte bearbeiten.&status=error`,
      })
    } else {
      await db.project.update({
        where: {
          id: project.id,
        },
        data: {
          imageUrl: publicUrl,
        },
      })
    }
  }

  // Everything successful
  posthog.capture({
    event: "create_project_success",
    properties: {
      title: data.title,
      description: data.description,
      banner: data.banner,
      emoji: data.emoji,
      teachers: data.teachers,
      date: data.date,
      time: data.time,
      maxStudents: data.maxStudents,
      minGrade: data.minGrade,
      maxGrade: data.maxGrade,
      location: data.location,
      price: data.price,
      sessionTracker,
    },
    distinctId: id,
  })
  return Response.json({
    redirectUrl: `/teachers/projects/feedback?msg=Projekt erfolgreich erstellt&status=success`,
  })
}
