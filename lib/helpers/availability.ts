// helpers.ts

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
    return false;
  }
  return !teacherLoads[teacherId]?.includes(day);
};
