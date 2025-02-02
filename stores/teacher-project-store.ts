import { Project } from "@prisma/client"
import { ProjectWithTeachers } from "@/lib/types"
import { create } from "zustand"
import { queryOwnProjects } from "@/lib/actions/queries/projects"

type TeacherProjectStore = {
  projects: ProjectWithTeachers[] | null
  fetchProjects: () => Promise<void>
}

export const useTeacherProjectStore = create<TeacherProjectStore>((set) => ({
  projects: null,

  fetchProjects: async () => {
    try {
      const ownProjects = await queryOwnProjects()
      set({ projects: ownProjects })
    } catch (error) {
      console.error("Failed to fetch teacher projects", error)
    }
  },
}))
