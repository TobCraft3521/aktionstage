"use server"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { TutorialStateType } from "@prisma/client"

export const queryTutorialState = async (tutorial: string) => {
  const id = (await auth())?.user?.id
  if (!id) return null
  const account = await db.account.findUnique({
    where: { id },
    include: { tutorialStates: true },
  })
  const state = account?.tutorialStates.find((t) => t.tutorial === tutorial)
  return state ? state.state : TutorialStateType.NOT_STARTED
}

export const finishTutorial = async (tutorial: string) => {
  const id = (await auth())?.user?.id
  if (!id) return
  await db.tutorialState.create({
    data: { state: TutorialStateType.FINISHED, accountId: id, tutorial },
  })
}
