import React from "react"
import { Badge } from "../ui/badge"

type Props = {
  children: React.ReactNode
}

const ChangeHint = ({ children }: Props) => {
  return (
    <Badge className="bg-yellow-500 animate-pulse">
      {children}
    </Badge>
  )
}

export default ChangeHint
