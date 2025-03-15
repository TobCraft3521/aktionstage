"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { queryStudents } from "@/lib/actions/queries/accounts"
import { useQuery } from "@tanstack/react-query"
import { set } from "lodash"
import { Check, ClipboardCheck, Copy, CopyCheck, Upload } from "lucide-react"
import React, { useState } from "react"

type Props = {}

const Students = (props: Props) => {
  const {
    data: students,
    isPending,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => queryStudents(),
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  return (
    <div className="w-full space-y-8 flex-1 flex flex-col">
      {/* header */}
      <div className="w-full flex flex-row items-center gap-4 h-8">
        <div className="">Sample Filter</div>
        <Input placeholder="Suchen nach Schülern" className="flex-1" />
        <Separator orientation="vertical" className="h-full" />
        <Button className="flex items-center gap-2">
          <Upload size={16} /> Importieren
        </Button>
        <Button variant="secondary">Hinzufügen</Button>
      </div>
      {/* table */}
      <ScrollArea className="bg-slate-100 h-full rounded-xl border border-slate-200 w-full">
        {error && <div>{error.message}</div>}
        {isPending && <div>Loading...</div>}
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead className="">Id</TableHead>
              <TableHead className="">Name</TableHead>
              <TableHead className="">Klasse</TableHead>
              <TableHead className="">Projekte</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((s, i) => (
              <TableRow
                key={i}
                className="hover:brightness-95 transition-all bg-slate-100 cursor-pointer"
              >
                <TableCell className="h-12 p-0 pl-4">
                  {copiedId === s.id ? (
                    <Check className="hover:bg-slate-200 h-8 w-8 p-2 rounded-lg" />
                  ) : (
                    <Copy
                      className="hover:bg-slate-200 h-8 w-8 p-2 rounded-lg"
                      onClick={() => {
                        setCopiedId(s.id)
                        navigator.clipboard.writeText(s.id)
                        setTimeout(() => setCopiedId(null), 2000)
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.grade}</TableCell>
                <TableCell>{}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

export default Students
