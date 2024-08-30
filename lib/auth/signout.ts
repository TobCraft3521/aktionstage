"use server"

import { signOut } from "./auth"

//server side signout to prevent auto signin after signout
export const signout = async () => {
  signOut()
}
