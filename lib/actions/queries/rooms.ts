"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export const queryRooms = async () => {
  return await db.room.findMany({
    include: {
      projects: {
        include: {
          participants: true,
        },
      },
    },
  })
}

export const queryRoomsWithProjectsWithTeachers = async () => {
  return await db.room.findMany({
    include: {
      projects: {
        include: {
          participants: true,
        },
      },
    },
  })
}

export const assignProjectToRoom = async (
  projectId: string,
  roomId: string
) => {
  try {
    await db.project.update({
      where: { id: projectId },
      data: { roomId },
    })
    return { error: false }
  } catch (error) {
    return { error: true }
  }
}

export const deleteRoom = async (roomId: string) => {
  try {
    const user = (await auth())?.user
    if (user?.role !== Role.ADMIN) return { error: true }
    await db.room.delete({ where: { id: roomId } })
    return { error: false }
  } catch (error) {
    return { error: true }
  }
}

export const kickProjectFromRoom = async (
  projectId: string,
  roomId: string
) => {
  try {
    const user = (await auth())?.user
    if (user?.role !== Role.ADMIN) return { error: true }
    await db.project.update({
      where: { id: projectId },
      data: { roomId: null },
    })
    return { error: false }
  } catch (error) {
    return { error: true }
  }
}
