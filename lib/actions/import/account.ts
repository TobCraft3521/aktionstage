"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { ImportedAccounts } from "@/lib/types"
import { Role } from "@prisma/client"

export const updateAccounts = async (
  accounts: ImportedAccounts,
  add?: boolean
) => {
  const user = (await auth())?.user
  if (!user) return
  const account = await db.account.findUnique({
    where: { id: user.id },
  })
  if (!account) return
  if (account.role !== Role.ADMIN) return
  let amount = 0
  try {
    // When !add we delete all students
    // AuthDetails and TutorialCompletions are onDelete: Cascade
    if (!add) {
      await db.account.deleteMany({})
    }

    // Add students
    const { count } = await db.account.createMany({
      data: accounts.map((a) => ({
        id: a.id,
        name: a.name || "",
        role: a.role,
        grade: a.grade,
        userName: a.userName || "",
        short: a.short || "",
      })),
      skipDuplicates: true,
    })

    amount = count

    for (const account of accounts) {
      try {
        await db.account.update({
          where: { id: account.id },
          data: {
            authDetails: account.password
              ? {
                  create: {
                    password: account.password,
                    initialPassword: account.initialPassword,
                  },
                }
              : undefined,

            projects: {
              connect: account.projectIds.map((id) => ({ id })),
            },
          },
        })
      } catch (error) {
        // error connecting something
        console.error(error)
      }
    }
  } catch (error) {
    console.error(error)
    return { error: true, amount }
  }
  return { error: undefined, amount }
}