import { create } from "zustand"

interface AdminTabStore {
  tab: number
  setTab: (index: number) => void
}

const useAdminTabStore = create<AdminTabStore>((set) => ({
  tab: 0,
  setTab: (index) => set({ tab: index }),
}))

export default useAdminTabStore
