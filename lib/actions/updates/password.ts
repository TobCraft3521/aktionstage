"use server"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import md5 from "md5"

export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const id = (await auth())?.user?.id
  if (!id) return { error: "Nicht angemeldet." }
  const user = await db.account.findUnique({
    where: {
      id,
      // check if the old password is correct
      password: md5(oldPassword),
    },
  })
  if (!user)
    return {
      error: "Das alte Passwort ist falsch.",
    }
  // update the password
  await db.account.update({
    where: {
      id,
    },
    data: {
      password: md5(newPassword),
    },
  })
  return {
    error: null,
  }
}
