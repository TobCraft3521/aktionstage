import { replaceProjectBanner } from "@/lib/actions/aws/replace"
import { queryProject } from "@/lib/actions/queries/projects"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { ProjectEditSchema } from "@/lib/form-schemas"

type Params = {
  params: {
    projectId: string
  }
}

// Edit project form
export const PATCH = async (req: Request, { params }: Params) => {
  try {
    const user = (await auth())?.user
    // Check if user is logged in
    if (!user) {
      return Response.json({ redirectUrl: "/login" })
    }

    const { projectId } = params
    const project = await queryProject(projectId)
    if (!project) {
      return Response.json({
        redirectUrl:
          "/teachers/projects?msg=Projekt nicht gefunden&status=error",
      })
    }

    // Check access (part of the project)
    if (
      !project.participants?.find(
        (t) => t.id === user.id && t.role === "TEACHER"
      )
    ) {
      return Response.json({
        redirectUrl: "/teachers/projects?msg=Kein Zugriff&status=error",
      })
    }

    // Parse form data
    const formData = await req.formData()

    // Convert FormData to a plain object
    const rawData: Record<string, any> = {}
    formData.forEach((value, key) => {
      rawData[key] = value
    })

    // Convert strings to numbers and teachers to array
    rawData.teachers = rawData.teachers ? rawData.teachers.split(",") : []
    rawData.price = parseFloat(rawData.price)
    rawData.maxStudents = parseInt(rawData.maxStudents)
    rawData.minGrade = parseInt(rawData.minGrade)
    rawData.maxGrade = parseInt(rawData.maxGrade)

    // Zod schema validation
    const { success, data } = ProjectEditSchema.safeParse(rawData)

    if (!success) {
      return Response.json({
        redirectUrl:
          "/teachers/projects/feedback?msg=Ungültige Daten&status=error",
      })
    }

    // For typescript, already checked above
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
      return Response.json({
        redirectUrl:
          "/teachers/projects/feedback?msg=Ungültige Daten&status=error",
      })
    }

    // Custom validation
    if (data.title.length > 32) {
      return Response.json({
        redirectUrl:
          "/teachers/projects/feedback?msg=Titel zu lang&status=error",
      })
    }

    // Check if teachers exist
    const otherTeacherIds = data.teachers || []
    // Ignore invalid teachers later
    const teachers = await db.account.findMany({
      where: {
        id: {
          // Double check current teacher is in the list
          in: [...otherTeacherIds, user.id],
        },
        OR: [{ role: "TEACHER" }, { role: "ADMIN" }],
      },
      select: {
        id: true,
        projects: true,
      },
    })

    // Check availability
    const conflictingProjects = await db.project.findMany({
      where: {
        day: data.date,
        participants: {
          some: {
            id: {
              in: teachers.map((teacher) => teacher.id),
            },
          },
        },
        NOT: {
          // Don't conflict with the current project
          id: projectId,
        },
      },
    })
    if (conflictingProjects.length > 0) {
      return Response.json({
        redirectUrl:
          "/teachers/projects/feedback?msg=Lehrer hat bereits Projekt an diesem Tag&status=error",
      })
    }

    // Update in database
    await db.project.update({
      where: {
        id: project.id,
      },
      data: {
        name: data.title,
        description: data.description,
        emoji: data.emoji,
        day: data.date,
        time: data.time,
        maxStudents: data.maxStudents,
        minGrade: data.minGrade,
        maxGrade: data.maxGrade,
        location: data.location,
        price: data.price,
        participants: {
          deleteMany: {
            OR: [{ role: "TEACHER" }, { role: "ADMIN" }],
          },
          connect: [...teachers.map((t) => ({ id: t.id }))],
        },
      },
    })

    // Image upload after updating the project
    /*
     Logic: If banner typeof File -> user wants to replace the image -> upload new image -> delete old image -> set new image url
     otherwise if string already changed above in project update
    */
    let currentImageUrl = project.imageUrl
    if (data.banner instanceof File) {
      // replace
      const { error, publicUrl } = await replaceProjectBanner(
        data.banner,
        currentImageUrl
      )
      if (error) {
        return Response.json({
          redirectUrl: `/teachers/projects/feedback?msg=Fehler beim Hochladen des Bildes, weitere Daten wurden aber gespeichert. Bitte bearbeiten.&status=warning`,
        })
      }
      if (currentImageUrl !== publicUrl) {
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

    // Room logic
    if (data.room) {
      const room = await db.room.findUnique({
        where: {
          id: data.room,
        },
        include: {
          projects: true,
        },
      })
      if (!room)
        return Response.json({
          redirectUrl: `/teachers/projects/feedback?msg=Raum nicht gefunden. Bitte bearbeiten.&status=warning`,
        })
      // Check if taken
      if (room.projects.find((p) => p.day === data.date)) {
        // Update project location
        await db.project.update({
          where: {
            id: project.id,
          },
          data: {
            // Teacher is responsible to edit this
            location: `Keine Ahnung`,
          },
        })
        return Response.json({
          redirectUrl: `/teachers/projects/feedback?msg=Raum wurde in der Zwischenzeit bereits belegt. Projekt: ${
            room.projects.find((p) => p.day === data.date)?.name
          }
                ". Weitere Änderungen wurden gespeichert. Bitte bearbeiten.&status=warning`,
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
          // E.g. ASG 226
          location: `ASG ${room.name}`,
        },
      })
    }

    return Response.json({
      redirectUrl: `/teachers/projects/feedback?msg=Änderungen erfolgreich gespeichert!&status=success`,
    })
  } catch (e) {
    return Response.json({
      redirectUrl:
        "/teachers/projects/feedback?msg=Ein Fehler ist aufgetreten&status=error",
    })
  }
}
