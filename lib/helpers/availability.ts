// helpers.ts

import { Day } from "@prisma/client"
import { AccountWithProjects } from "../types"

export const isTeacherAlreadyAdded = (
  teacherId: string,
  addedTeachers: { id: string }[]
) => addedTeachers.some((t) => t.id === teacherId)

export const isCurrentUser = (
  teacherId: string,
  currentUserId: string | undefined
) => teacherId === currentUserId

export const wasPreviouslyAdded = (
  teacherId: string,
  projectTeachers: { id: string }[],
  addedTeachers: { id: string }[]
) =>
  projectTeachers.some(
    (t) => t.id === teacherId && !addedTeachers.some((t) => t.id === teacherId)
  )

// Check whether or not teachers already have a project on the given date
export const isTeacherAvailable = (
  teacherId: string,
  day: string | undefined,
  teacherLoads: Record<string, string[]>
) => {
  if (day === undefined) {
    return false
  }
  return !teacherLoads[teacherId]?.includes(day)
}

export const getStudentAvailability = (s?: AccountWithProjects) => {
  if (!s) return { [Day.MON]: false, [Day.TUE]: false, [Day.WED]: false }
  return {
    [Day.MON]: !s.projects.some((p) => p.day === Day.MON),
    [Day.TUE]: !s.projects.some((p) => p.day === Day.TUE),
    [Day.WED]: !s.projects.some((p) => p.day === Day.WED),
  }
}
