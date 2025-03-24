import { Account, AuthDetails, Project, Room } from "@prisma/client"

export type AccountWithPassword = Account & {
  authDetails: AuthDetails | null
}
export type RoomWithProjects = Room & { projects: Project[] }
export type ProjectWithParticipants = Project & {
  participants: Account[]
}
export type ImportedAccounts = (Partial<Account> & {
  password: string
  initialPassword: string
  projectIds: string[]
})[]
export type AccountWithProjectsAndPassword = AccountWithPassword & {
  projects: Project[]
}
export type RoomWithProjectsWithParticipants = Room & {
  projects: ProjectWithParticipants[]
}
export type ImportedProjects = (Partial<Project> & {
  participantIds: string[]
})[]

export type ImportedRooms = (Partial<Room> & { projectIds: string[] })[]
export type AccountWithProjects = Account & { projects: Project[] }

export type Filter<T> = {
  label: string
  render: (value: any, setValue: (val: any) => void) => React.ReactNode
  filterFn: (row: T, value: any) => boolean
}
