import { Project } from "@prisma/client"
import { create } from "zustand"

interface AppStateStore {
  searchResults: Project[]
  setSearchResults: (searchResults: Project[]) => void
}

export const useAppState = create<AppStateStore>((set) => ({
  searchResults: [],
  setSearchResults: (searchResults) => set({ searchResults }),
}))
