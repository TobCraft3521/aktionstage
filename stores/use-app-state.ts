import { Day, Project } from "@prisma/client"
import { create } from "zustand"

export interface Search {
  query?: string
  grade?: number
  day?: Day
  teacher?: string
}

interface SearchStateStore {
  search: Search
  setSearch: (search: Search) => void
}

export const useSearchState = create<SearchStateStore>((set) => ({
  search: {},
  setSearch: (search) => set({ search }),
}))
