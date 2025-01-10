"use server"

import { db } from "@/lib/db"

// bind query to dependency: currentPage = room picker page -> live data, fewer collisions when teachers pick the same room because of old data
// on submit: loader -> forward to either success page or to the error page saying that someone else had claimed the room in the meantime
export const queryRooms = async () => {
  return await db.room.findMany({
    include: {
      project: {
        include: {
          teachers: true,
        },
      },
    },
  })
}

// claim room in internal, only accessible through create project and edit project
