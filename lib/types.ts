import { z } from "zod"

export const CreateOrgFormSchema = z.object({
  img: z
    .any()
    .refine((files) => files.length > 0, {
      message: "Organization Image is required",
    })
    .describe("Organization Image"),
})
