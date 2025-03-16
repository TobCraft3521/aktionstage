import { Account, Project, Room } from "@prisma/client"
import {
  AccountWithPassword,
  ProjectWithStudentsWithTeachers,
  ProjectWithTeachers,
  RoomWithProjects,
} from "../types"
import Papa from "papaparse"

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

export const exportStudents = async (students: AccountWithPassword[]) => {
  const csv = Papa.unparse({
    fields: ["Id", "Name", "Klasse", "Password_Hash"],
    data: students.map((s) => [
      s.id,
      s.name,
      s.grade,
      s.authDetails?.password ?? "",
    ]),
  })

  downloadCSV(csv, "students.csv")
}

export const exportTeachers = async (teachers: AccountWithPassword[]) => {
  const csv = Papa.unparse({
    fields: ["Id", "Name", "Kürzel", "Password_Hash"],
    data: teachers.map((t) => [
      t.id,
      t.name,
      t.short,
      t.authDetails?.password ?? "",
    ]),
  })

  downloadCSV(csv, "teachers.csv")
}

export const exportProjects = async (
  projects: ProjectWithStudentsWithTeachers[]
) => {
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
      "Lehrer",
      "Preis",
      "Maximale Schüler",
      "Minimale Klasse",
      "Maximale Klasse",
      "Schüler",
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
      p.teachers.map((t: Account) => t.id).join(","),
      p.price,
      p.maxStudents,
      p.minGrade,
      p.maxGrade,
      p.students.map((s: Account) => s.id).join(","),
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
