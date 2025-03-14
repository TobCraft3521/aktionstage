import { z } from "zod"
import { ProjectWithTeachers } from "../types"
import { ProjectEditSchema } from "../form-schemas"

export type ChangedFields = {
  [Key in keyof z.infer<typeof ProjectEditSchema>]: boolean
}

export const getChangedFields = (
  currentProject: ProjectWithTeachers,
  newProject: z.infer<typeof ProjectEditSchema>
) => {
  // console.log("🔍 Checking for changed fields...")
  // console.log("Current Project:", currentProject)
  // console.log("New Project:", newProject)

  const title = currentProject.name !== newProject.title
  // console.log(
  //   "Title changed:",
  //   title,
  //   "|",
  //   currentProject.name,
  //   "→",
  //   newProject.title
  // )

  const description = currentProject.description !== newProject.description
  // console.log(
  //   "Description changed:",
  //   description,
  //   "|",
  //   currentProject.description,
  //   "→",
  //   newProject.description
  // )

  const banner =
    newProject.banner instanceof File ||
    newProject.banner !== currentProject.imageUrl // If unchanged, it's an empty string
  // console.log(
  //   "Banner changed:",
  //   banner,
  //   "|",
  //   currentProject.imageUrl,
  //   "→",
  //   newProject.banner
  // )

  const emoji = currentProject.emoji !== newProject.emoji
  // console.log(
  //   "Emoji changed:",
  //   emoji,
  //   "|",
  //   currentProject.emoji,
  //   "→",
  //   newProject.emoji
  // )

  const currentTeacherIds = currentProject.teachers.map((t) => t.id).sort()
  const newTeacherIds = (newProject.teachers || []).sort()
  const teachers =
    JSON.stringify(currentTeacherIds) !== JSON.stringify(newTeacherIds)

  const minGrade = currentProject.minGrade !== newProject.minGrade
  // console.log(
  //   "Min Grade changed:",
  //   minGrade,
  //   "|",
  //   {
  //     minGrade: currentProject.minGrade,
  //   },
  //   "→",
  //   {
  //     minGrade: newProject.minGrade,
  //   }
  // )

  const maxGrade = currentProject.maxGrade !== newProject.maxGrade
  // console.log(
  //   "Max Grade changed:",
  //   maxGrade,
  //   "|",
  //   {
  //     maxGrade: currentProject.maxGrade,
  //   },
  //   "→",
  //   {
  //     maxGrade: newProject.maxGrade,
  //   }
  // )

  const maxStudents = currentProject.maxStudents !== newProject.maxStudents

  const location = currentProject.location !== newProject.location
  // console.log(
  //   "Location changed:",
  //   location,
  //   "|",
  //   currentProject.location,
  //   "→",
  //   newProject.location
  // )

  const price = currentProject.price !== newProject.price
  // console.log(
  //   "Price changed:",
  //   price,
  //   "|",
  //   currentProject.price,
  //   "→",
  //   newProject.price
  // )

  const time = currentProject.time !== newProject.time
  // console.log(
  //   "Time changed:",
  //   time,
  //   "|",
  //   currentProject.time,
  //   "→",
  //   newProject.time
  // )

  const date = currentProject.day !== newProject.date
  // console.log(
  //   "Date changed:",
  //   date,
  //   "|",
  //   currentProject.day,
  //   "→",
  //   newProject.date
  // )

  return {
    title,
    description,
    banner,
    emoji,
    teachers,
    minGrade,
    maxGrade,
    maxStudents,
    location,
    price,
    time,
    date,
  } as ChangedFields
}
