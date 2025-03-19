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
import { cn } from "@/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Copy, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type Column<T> = {
  label: string
  render: (row: T) => React.ReactNode
  isId?: boolean // Flag to identify ID column
  noPadding?: boolean
}

type Props<T> = {
  title: string
  queryKey: string
  queryFn: () => Promise<T[]>
  columns: Column<T>[]
  // => /admin/[manageItem]/[id] for custom route
  manageItem: string
}

const ManageTable = <T extends { id: string; name: string }>({
  title,
  queryKey,
  queryFn,
  columns,
  manageItem,
}: Props<T>) => {
  const {
    data: rows,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => queryFn(), // ✅ Wrapped properly
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient()
  const router = useRouter()

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
      </div>

      {(rows?.length || 0) > 0 || isPending ? (
        /* Table */
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
                    {columns.map(
                      (_, j) =>
                        j !== 0 /* not the id collumn */ && (
                          <TableCell key={j}>
                            <Skeleton className="bg-slate-200 w-full h-[20px]" />
                          </TableCell>
                        )
                    )}
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
                    onClick={() =>
                      router.push(
                        `/admin/${manageItem}/${row.id}?queryKey=${queryKey}`
                      )
                    } // Query key for instant data
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
                      <TableCell
                        className={cn(col.noPadding && "h-12 p-0 pl-4")}
                        key={j}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <div className="bg-slate-100 h-full rounded-lg flex border border-slate-200 w-full justify-center items-center flex-col gap-4">
          <div className="flex-col flex items-center justify-center text-lg drop-shadow-xl gap-4">
            <div className="text-7xl">🫗</div>
            Nichts im Angebot für dich...
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageTable
