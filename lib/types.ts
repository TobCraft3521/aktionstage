import { Account, Project } from "@prisma/client"

export type ProjectWithTeachers = Project & { teachers: Account[] }
