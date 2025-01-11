import { z } from "zod"

export const LoginFormSchema = z.object({
  name: z.string().min(1, "Kein Name angegeben." ),
  password: z
    .string()
    .min(1, "Kein Passwort angegeben.")
    .trim()
    .describe("Password"),
})
