import { Day } from "@prisma/client"
import { z } from "zod"

export const LoginFormSchema = z.object({
  name: z.string().min(1, "Kein Name angegeben."),
  password: z
    .string()
    .min(1, "Kein Passwort angegeben.")
    .trim()
    .describe("Password"),
})

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "Kein Name angegeben").max(32, "Name zu lang"),
  description: z.string().min(1, "Keine Beschreibung angegeben"),
  // File or URL
  banner: z.union([
    z
      .string()
      .url("Kein gültiger Bild-Link")
      .min(1, "Kein Bild hochgeladen oder Link angegeben"), // Custom URL option
    z
      .instanceof(File)
      .refine(
        (file) =>
          ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
            file.type
          ),
        {
          message:
            "Ungültiges Bildformat, nur JPEG, PNG, GIF oder WebP sind erlaubt.",
        }
      ),
  ]),
  emoji: z.string().min(1, "Kein Emoji ausgewählt"),
  teachers: z.array(z.string()).optional().default([]),
  maxStudents: z.number().min(1, "Mindestens 1 Schüler ist erforderlich"),
  minGrade: z.number().min(5, "Ungültige Jahrgangsstufen"),
  maxGrade: z.number().max(11, "Ungültige Jahrgangsstufen"),
  location: z.string().min(1, "Kein Ort angegeben"),
  price: z.number().min(0, "Preis muss größer oder gleich 0 sein"),
  time: z.string().min(1, "Keine Zeit angegeben"),
  date: z.enum([Day.MON, Day.TUE, Day.WED], { message: "Kein Tag ausgewählt" }),
  room: z.string().optional(),
})

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Kein altes Passwort angegeben"),
  newPassword: z.string().min(1, "Kein neues Passwort angegeben"),
  newPasswordRepeat: z.string().min(1, "Kein neues Passwort wiederholt"),
})

export const ProjectEditSchema = CreateProjectSchema
