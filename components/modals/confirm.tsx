"use client"
// components/ConfirmModal.tsx
import { useConfirmModal } from "@/stores/confirm-modal"
import React, { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import Loader from "../global/loader"

export const ConfirmModal: React.FC = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    closeConfirmModal,
  } = useConfirmModal()
  const [isLoading, setIsLoading] = useState(false)
  const handleConfirm = async () => {
    setIsLoading(true)
    if (onConfirm) await onConfirm()
    setIsLoading(false)
    closeConfirmModal()
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    closeConfirmModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeConfirmModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>{message}</p>
        <DialogFooter>
          <Button onClick={handleCancel}>{cancelText}</Button>
          <Button onClick={handleConfirm} variant={"destructive"}>
            {!isLoading ? confirmText : <Loader />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
