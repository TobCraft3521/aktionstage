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
import { Filter } from "@/lib/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Copy, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
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
  importFn: (data: File) => void
  addFn: (data: File) => void
  exportFn: (data: T[]) => void
  columns: Column<T>[]
  // => /admin/[manageItem]/[id] for custom route
  manageItem: string
  filters?: Filter<T>[] // Add filters
}

// Require name to provide search functionality by default. Can be removed for other use cases.
const AdminTable = <T extends { id: string; name: string }>({
  title,
  queryKey,
  queryFn,
  importFn,
  addFn,
  exportFn,
  columns,
  manageItem,
  filters,
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
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  // Update function for filters
  const setFilterValue = (label: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [label]: value }))
  }

  // Reset function
  const resetFilters = () => {
    setSearchTerm("") // Reset search input

    if (!filters) return
    // Dynamically reset each filter based on its type
    const resetValues = Object.fromEntries(
      filters.map((f) => [
        f.label,
        typeof filterValues[f.label] === "number" ? undefined : "",
      ])
    )

    setFilterValues(resetValues)
  }

  const filteredRows = useMemo(() => {
    return rows
      ?.filter((row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      ?.filter(
        (row) =>
          filters?.every((filter) =>
            filter.filterFn(row, filterValues[filter.label])
          ) ?? true
      )
  }, [rows, searchTerm, filterValues, filters])

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
        {filters?.map((filter, index) => (
          <div key={index}>
            {filter.render(filterValues[filter.label], (val) =>
              setFilterValue(filter.label, val)
            )}
          </div>
        ))}
        {/* Reset Filters Button */}
        <Button variant="default" onClick={resetFilters}>
          Reset
        </Button>
        <Separator orientation="vertical" className="h-full" />
        <Button className="p-0">
          <label
            htmlFor="import-csv"
            className="flex items-center gap-2 p-2 px-4 cursor-pointer"
          >
            <Upload size={16} /> Importieren
          </label>
        </Button>
        <Button variant="secondary" className="p-0">
          <label
            htmlFor="add-csv"
            className="flex items-center gap-2 p-2 px-4 cursor-pointer"
          >
            Hinzufügen
          </label>
        </Button>
        <Button variant="secondary" onClick={() => exportFn(rows || [])}>
          Exportieren
        </Button>
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
                    onClick={
                      manageItem
                        ? () => {
                            router.push(
                              `/admin/${manageItem}/${row.id}?queryKey=${queryKey}`
                            ) // Query key for instant data
                          }
                        : undefined
                    }
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
      ) : (
        <div className="bg-slate-100 h-full rounded-lg flex border border-slate-200 w-full justify-center items-center flex-col gap-4">
          <div className="flex-col flex items-center justify-center text-lg drop-shadow-xl gap-4">
            <div className="text-7xl">🫗</div>
            Nichts im Angebot für dich...
          </div>
          {/* import */}

          <Button className="p-0">
            <label
              htmlFor="import-csv"
              className="flex items-center gap-2 p-2 px-4 cursor-pointer"
            >
              <Upload size={16} /> Importieren
            </label>
          </Button>
        </div>
      )}
      {/* hidden file inputs */}
      <input
        type="file"
        id="import-csv"
        accept=".csv"
        className="hidden"
        onChange={async (e) => {
          if (e.target.files?.length === 0 || !e.target.files) return
          await importFn(e.target.files[0])
          refetch()
          // Clear the input for the next file
          e.target.value = ""
        }}
      />
      <input
        type="file"
        id="add-csv"
        accept=".csv"
        className="hidden"
        onChange={async (e) => {
          if (e.target.files?.length === 0 || !e.target.files) return
          await addFn(e.target.files[0])

          // Clear the input for the next file
          e.target.value = ""
        }}
      />
    </div>
  )
}

export default AdminTable
