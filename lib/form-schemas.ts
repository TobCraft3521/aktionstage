import { z } from "zod"

export const LoginFormSchema = z.object({
  name: z.string().min(1).trim().describe("Name"),
  password: z.string().min(1).trim().describe("Password"),
})
