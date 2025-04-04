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
import { lookUpDay } from "@/lib/helpers/lookupname"
import { ProjectWithParticipants } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { DM_Sans } from "next/font/google"
import React from "react"

const dmSans = DM_Sans({
  weight: "600",
  subsets: ["latin"],
})

export const StudentsOverview = React.forwardRef<
  HTMLDivElement,
  { projectId: string; project?: Partial<ProjectWithParticipants> }
>(({ projectId, project }, ref) => {
  const { data: students, isPending: isStudentsLoading } = useQuery({
    queryKey: ["students", projectId],
    queryFn: () => queryProjectStudents(projectId),
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
              <TableCell className={"h-12 p-0 pl-4"}>
                <h1 className="flex flex-row gap-2 items-center">
                  <p
                    className={cn(
                      s.name === "Tobias Hackenberg" &&
                        "text-orange-500 font-extrabold"
                    )}
                  >
                    {s?.name || `Noname`}
                  </p>
                  {s.role === Role.VIP && (
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-0.5 px-2 text-xs text-white font-extrabold flex items-center">
                      👑 VIP
                    </span>
                  )}
                </h1>
              </TableCell>
              <TableCell className="text-right">{s.grade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption className="text-slate-300">
          <p>
            {project?.name}{" "}
            {project?.day && lookUpDay[project.day as keyof typeof lookUpDay]} -
          </p>
          Die Aktionstage Webseite <br />
          von Tobias Hackenberg 10a :)
        </TableCaption>
      </Table>
    </div>
  )
})

StudentsOverview.displayName = "StudentsOverview"
