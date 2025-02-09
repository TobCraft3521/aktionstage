// stores/useConfirmModal.ts
import { create } from "zustand"

interface ConfirmModalStore {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
  openConfirmModal: (params: {
    confirmCallback?: () => void
    cancelCallback?: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }) => void
  closeConfirmModal: () => void
}

export const useConfirmModal = create<ConfirmModalStore>((set) => ({
  isOpen: false,
  title: "Bist du sicher?", // Are you sure?
  message: "Willst du das wirklich tun?", // Do you really want to do this?
  confirmText: "Ja", // Yes
  cancelText: "Nein", // No
  onConfirm: null,
  onCancel: null,
  openConfirmModal: ({
    confirmCallback = null,
    cancelCallback = null,
    title,
    message,
    confirmText,
    cancelText,
  }) =>
    set((state) => ({
      isOpen: true,
      onConfirm: confirmCallback,
      onCancel: cancelCallback,
      title: title ?? state.title, // Use existing value if not overridden
      message: message ?? state.message, // Use existing value if not overridden
      confirmText: confirmText ?? state.confirmText, // Use existing value if not overridden
      cancelText: cancelText ?? state.cancelText, // Use existing value if not overridden
    })),
  closeConfirmModal: () =>
    set({ isOpen: false, onConfirm: null, onCancel: null }),
}))
