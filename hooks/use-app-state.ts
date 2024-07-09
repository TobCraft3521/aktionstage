import { Day, Project } from "@prisma/client"
import { create } from "zustand"

export interface Search {
  query?: string
  grade?: number
  day?: Day
  teacher?: string
}

interface AppStateStore {
  searchResults: Project[]
  setSearchResults: (searchResults: Project[]) => void
  search: Search
  setSearch: (search: Search) => void
}

export const useAppState = create<AppStateStore>((set) => ({
  searchResults: [],
  setSearchResults: (searchResults) => set({ searchResults }),
  search: {},
  setSearch: (search) => set({ search }),
}))
