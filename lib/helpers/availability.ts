// helpers.ts

export const isTeacherAlreadyAdded = (
  teacherId: string,
  addedTeachers: { id: string }[]
) => addedTeachers.some((t) => t.id === teacherId)

export const isTeacherUnavailable = (
  teacherId: string,
  day: string | undefined,
  allTeacherLoads: Record<string, string[]>
) => day === undefined || allTeacherLoads?.[teacherId || ""]?.includes(day)

export const isCurrentUser = (
  teacherId: string,
  currentUserId: string | undefined
) => teacherId === currentUserId

export const isTeacherAssignedToProject = (
  teacherId: string,
  projectTeachers: { id: string }[],
  addedTeachers: { id: string }[]
) =>
  projectTeachers.some(
    (t) => t.id === teacherId && !addedTeachers.some((t) => t.id === teacherId)
  )

export const isTeacherAssignedToProjectSingleProject = (
  teacherId: string,
  addedTeachers: { id: string }[]
) => addedTeachers.some((t) => t.id === teacherId)

// Check whether or not teachers already have a project on the given date
export const isTeacherFreeOnDay = (
  teacherId: string,
  day: string,
  teacherLoads: Record<string, string[]>
) => {
  return !teacherLoads[teacherId]?.includes(day)
}
