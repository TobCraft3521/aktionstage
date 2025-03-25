"use server"

import { db } from "@/lib/db"

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
