import React from "react"
import { DM_Sans } from "next/font/google"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import AsgLogo from "@/components/global/asg-logo"

const dmSans = DM_Sans({
  weight: "600",
  subsets: ["latin"],
})

export const StudentsOverview = React.forwardRef<HTMLDivElement, {}>(
  (props, ref) => {
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
            <TableRow>
              <TableCell className="font-medium">
                <Checkbox />
              </TableCell>
              <TableCell>1</TableCell>
              <TableCell>Tobias Hackenberg</TableCell>
              <TableCell className="text-right">10a</TableCell>
            </TableRow>
          </TableBody>
          <TableCaption className="text-slate-300">
            <p>Bouldern Steinbock Montag -</p>
            Die Aktionstage Webseite <br />
            von Tobias Hackenberg 10a :)
          </TableCaption>
        </Table>
      </div>
    )
  }
)

StudentsOverview.displayName = "StudentsOverview"
