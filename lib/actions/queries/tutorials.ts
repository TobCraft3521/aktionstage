"use server"
import { auth } from "@/lib/auth/auth"
import { TutorialState } from "@prisma/client"

export const queryTutorialState = async () => {
  const account = await auth()
  console.log("account", account)
  return TutorialState.NOT_STARTED
}
