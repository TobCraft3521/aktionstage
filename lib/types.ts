import { Account, AuthDetails, Project, Room } from "@prisma/client"

export type ProjectWithTeachers = Project & { teachers: Account[] }
export type AccountWithPassword = Account & {
  authDetails: AuthDetails | null
}
export type RoomWithProjects = Room & { projects: Project[] }
export type ProjectWithStudentsWithTeachers = Project & {
  students: Account[]
  teachers: Account[]
}
