"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Tutorial } from "@prisma/client"

export const queryTutorialComplete = async (tutorial: string) => {
  const id = (await auth())?.user?.id
  if (!id) return false
  const account = await db.account.findUnique({
    where: { id },
    include: { toturialCompletions: true },
  })
  const completion = account?.toturialCompletions.find(
    (t) => t.tutorial.toLowerCase() === tutorial
  )
  return completion ? true : false
}

export const finishTutorial = async (tutorial: Tutorial) => {
  const id = (await auth())?.user?.id
  if (!id) return
  await db.tutorialCompletion.create({
    data: { accountId: id, tutorial },
  })
}
