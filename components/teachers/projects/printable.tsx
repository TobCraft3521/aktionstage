import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { queryProjectStudents } from "@/lib/actions/queries/accounts"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { DM_Sans } from "next/font/google"
import React from "react"

const dmSans = DM_Sans({
  weight: "600",
  subsets: ["latin"],
})

export const StudentsOverview = React.forwardRef<
  HTMLDivElement,
  { projectId: string }
>(({ projectId }, ref) => {
  const { data: students, isPending: isStudentsLoading } = useQuery({
    queryKey: ["students", projectId],
    queryFn: () => queryProjectStudents(projectId),
    // not needed fo printing
    // refetchInterval: 5000,
  })
  return (
    <div
      ref={ref}
      className={cn("w-screen h-screen p-32 space-y-4", dmSans.className)}
    >
      <h1 className="text-4xl font-semibold">Anmeldungs Liste</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Da</TableHead>
            <TableHead>Nr.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Klasse</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students?.map((s, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">
                <Checkbox />
              </TableCell>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell className="text-right">{s.grade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption className="text-slate-300">
          <p>Bouldern Steinbock Montag -</p>
          Die Aktionstage Webseite <br />
          von Tobias Hackenberg 10a :)
        </TableCaption>
      </Table>
    </div>
  )
})

StudentsOverview.displayName = "StudentsOverview"
