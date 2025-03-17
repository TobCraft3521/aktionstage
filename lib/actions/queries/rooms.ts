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
