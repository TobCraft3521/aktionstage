"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { Check, Copy, Upload } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Column<T> = {
  label: string
  render: (row: T) => React.ReactNode
  isId?: boolean // Flag to identify ID column
}

type Props<T> = {
  title: string
  queryKey: string
  queryFn: () => Promise<T[]>
  importFn: () => void
  addFn: () => void
  exportFn: (data: T[]) => void
  columns: Column<T>[]
}

const AdminTable = <T extends { id: string; name: string }>({
  title,
  queryKey,
  queryFn,
  importFn,
  addFn,
  exportFn,
  columns,
}: Props<T>) => {
  const {
    data: rows,
    isPending,
    error,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => queryFn(), // ✅ Wrapped properly
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter data based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows // No search term, return all rows
    return rows?.filter((row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [rows, searchTerm])

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (copiedId) {
      timeout = setTimeout(() => setCopiedId(null), 2000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [copiedId])

  return (
    <div className="w-full space-y-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="w-full flex flex-row items-center gap-4 h-8">
        <Input
          placeholder={`Suche ${title}`}
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Separator orientation="vertical" className="h-full" />
        <Button onClick={importFn} className="flex items-center gap-2">
          <Upload size={16} /> Importieren
        </Button>
        <Button onClick={addFn} variant="secondary">
          Hinzufügen
        </Button>
        <Button variant="secondary" onClick={() => exportFn(rows || [])}>
          Exportieren
        </Button>
      </div>

      {/* Table */}
      <ScrollArea className="bg-slate-100 h-full rounded-lg border border-slate-200 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {/* ID column comes first */}
              <TableHead>Id</TableHead>

              {/* Dynamically render other columns */}
              {columns.map((col, i) => (
                <TableHead key={i}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-red-500"
                >
                  {error.message}
                </TableCell>
              </TableRow>
            ) : isPending ? (
              new Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="bg-slate-200 w-[20px] h-[20px]" />
                  </TableCell>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="bg-slate-200 w-full h-[20px]" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="bg-slate-200 w-[40px] h-[20px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredRows?.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:brightness-95 transition-all bg-slate-100 cursor-pointer"
                >
                  {/* Render ID column first */}
                  <TableCell className="h-12 p-0 pl-4">
                    {copiedId === row.id ? (
                      <Check className="hover:bg-slate-200 h-8 w-8 p-2 rounded-lg" />
                    ) : (
                      <Copy
                        className="hover:bg-slate-200 h-8 w-8 p-2 rounded-lg"
                        onClick={() => {
                          setCopiedId(row.id)
                          navigator.clipboard.writeText(row.id)
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Dynamically render other columns */}
                  {columns.map((col, j) => (
                    <TableCell key={j}>{col.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

export default AdminTable
