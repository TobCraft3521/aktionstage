"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { ImportedRooms } from "@/lib/types"
import { Role } from "@prisma/client"

export const updateRooms = async (rooms: ImportedRooms, add?: boolean) => {
  const user = (await auth())?.user
  if (!user) return
  const account = await db.account.findUnique({
    where: { id: user.id },
  })
  if (!account) return
  if (account.role !== Role.ADMIN) return
  let amount = 0
  try {
    // When !add we delete all rooms
    if (!add) {
      await db.room.deleteMany({})
    }

    // Add students
    const { count } = await db.room.createMany({
      data: rooms.map((a) => ({
        id: a.id,
        name: a.name || "",
      })),
      skipDuplicates: true,
    })

    amount = count

    for (const room of rooms) {
      try {
        await db.room.update({
          where: { id: room.id },
          data: {
            ...(room.projectIds?.length > 0 && {
              projects: {
                connect: room.projectIds.map((id) => ({ id })),
              },
            }),
          },
        })
      } catch (error) {
        // error connecting something
        console.error(error)
      }
    }
  } catch (error) {
    console.error(error)
    return {
      error: true,
      amount,
    }
  }
  return {
    error: undefined,
    amount,
  }
}
