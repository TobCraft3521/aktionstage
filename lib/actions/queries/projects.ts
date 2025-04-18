"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export const queryProjects = async () => {
  const projects = await db.project.findMany({
    include: {
      participants: true,
    },
  })

  return projects.sort(
    (a, b) =>
      ["MON", "TUE", "WED"].indexOf(a.day) -
      ["MON", "TUE", "WED"].indexOf(b.day)
  )
}

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

export const kickAccount = async (projectId: string, accountId: string) => {
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
  if (!project.participants.find((p) => p.id === accountId))
    return redirect("/login")
  await db.project.update({
    where: {
      id: projectId,
    },
    data: {
      participants: {
        disconnect: {
          id: accountId,
        },
      },
    },
  })
}

export const assignAccount = async (projectId: string, accountId: string) => {
  const id = (await auth())?.user?.id
  if (!id) return { error: "no id[ea] haha" }
  const user = await db.account.findUnique({
    where: {
      id,
    },
  })

  if (!user?.role || user.role !== Role.ADMIN) return { error: "no admin" }
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      participants: true,
    },
  })
  if (!project) return { error: "no project" }
  if (project.participants.find((p) => p.id === accountId))
    return { error: "account already in project" }
  await db.project.update({
    where: {
      id: projectId,
    },
    data: {
      participants: {
        connect: {
          id: accountId,
        },
      },
    },
  })
  return { error: false }
}

export const queryAccountsForProject = async (projectId: string) => {
  const accounts = await db.account.findMany({
    where: {
      projects: {
        some: {
          id: projectId,
        },
      },
    },
    include: {
      projects: true,
    },
  })

  return accounts
}

export const queryStudentsForProject = async (projectId: string) => {
  const accounts = await db.account.findMany({
    where: {
      projects: {
        some: {
          id: projectId,
        },
      },
      OR: [{ role: Role.VIP }, { role: Role.VIP }],
    },
    include: {
      projects: true,
    },
  })

  return accounts
}

export const queryTeachersForProject = async (projectId: string) => {
  const accounts = await db.account.findMany({
    where: {
      projects: {
        some: {
          id: projectId,
        },
      },
      OR: [{ role: Role.TEACHER }, { role: Role.ADMIN }],
    },
    include: {
      projects: true,
    },
  })

  return accounts
}

export const queryProjectRoom = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      room: true,
    },
  })

  return project?.room
}

export const queryChosenProjects = async () => {
  const id = (await auth())?.user?.id
  if (!id) return { error: "no id[ea] haha" }
  const student = await db.account.findUnique({
    where: {
      id,
      OR: [{ role: Role.STUDENT }, { role: Role.VIP }],
    },
    include: {
      projects: {
        include: {
          participants: true,
        },
      },
    },
  })
  if (!student) return { error: "no student" }
  // Order for display
  return student.projects.sort(
    (a, b) =>
      ["MON", "TUE", "WED"].indexOf(a.day) -
      ["MON", "TUE", "WED"].indexOf(b.day)
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
