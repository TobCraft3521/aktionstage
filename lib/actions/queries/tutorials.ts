"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { Tutorial } from "@prisma/client"

// Query if a tutorial is complete
export const queryTutorialComplete = async (tutorial: string) => {
  const id = (await auth())?.user?.id
  if (!id) return false

  const account = await db.account.findUnique({
    where: { id },
    include: { toturialCompletions: true },
  })

  const completion = account?.toturialCompletions.find(
    (t) => t.tutorial.toLowerCase() === tutorial.toLowerCase()
  )

  return completion ? true : false
}

// General function to set tutorial completion status (true = complete, false = incomplete)
export const setTutorialComplete = async (
  tutorial: Tutorial,
  isComplete: boolean
) => {
  const id = (await auth())?.user?.id
  if (!id) return

  if (isComplete) {
    // Mark tutorial as complete (create entry)
    await db.tutorialCompletion.create({
      data: { accountId: id, tutorial },
    })
  } else {
    // Mark tutorial as incomplete (delete entry)
    await db.tutorialCompletion.deleteMany({
      where: { accountId: id, tutorial },
    })
  }
}

// Finish tutorial (wrapper for setTutorialComplete to mark as complete)
export const finishTutorial = async (tutorial: Tutorial) => {
  await setTutorialComplete(tutorial, true)
}
