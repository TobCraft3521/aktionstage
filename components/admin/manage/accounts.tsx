import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Trash2, Key, UserCog, FolderOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { queryProjectsForAccount } from "@/lib/actions/queries/projects"
import { Role, Account } from "@prisma/client"
import { cn } from "@/lib/utils"

type Project = {
  name: string
}

type Props = {
  account?: Account
}

const ManageAccountActions: React.FC<Props> = ({ account }) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  return <div className=""></div>
}

export default ManageAccountActions
