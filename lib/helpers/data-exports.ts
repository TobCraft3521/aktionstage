import { Account } from "@prisma/client"
import Papa from "papaparse"
import {
  AccountWithProjectsAndPassword,
  ProjectWithParticipants,
  RoomWithProjects,
} from "../types"

// Central download function
const downloadCSV = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportAccounts = async (
  students: AccountWithProjectsAndPassword[]
) => {
  const csv = Papa.unparse({
    fields: [
      "Id",
      "Name",
      "Klasse",
      "Password_Hash",
      "Projekte",
      "Rolle",
      "Kuerzel",
    ],
    data: students.map((s) => [
      s.id,
      s.name,
      s.grade,
      s.authDetails?.password ?? "",
      s.projects.map((p) => p.id).join(","),
      s.role,
      s.short,
    ]),
  })

  downloadCSV(csv, "accounts.csv")
}

export const exportProjects = async (projects: ProjectWithParticipants[]) => {
  const csv = Papa.unparse({
    fields: [
      "Id",
      "Titel",
      "Beschreibung",
      "Banner",
      "Emoji",
      "Tag",
      "Uhrzeit",
      "Ort",
      "Preis",
      "Maximale Schüler",
      "Minimale Klasse",
      "Maximale Klasse",
      "Teilnehmer",
    ],
    data: projects.map((p) => [
      p.id,
      p.name,
      p.description,
      p.imageUrl,
      p.emoji,
      p.day,
      p.time,
      p.location,
      p.price,
      p.maxStudents,
      p.minGrade,
      p.maxGrade,
      p.participants.map((t) => t.id).join(","),
    ]),
  })

  downloadCSV(csv, "projects.csv")
}

export const exportRooms = async (rooms: RoomWithProjects[]) => {
  const csv = Papa.unparse({
    fields: ["Id", "Name", "Projekte"],
    data: rooms.map((r) => [
      r.id,
      r.name,
      r.projects?.map((p) => p.id).join(","),
    ]),
  })

  downloadCSV(csv, "rooms.csv")
}
