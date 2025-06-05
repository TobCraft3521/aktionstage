import { Day } from "@prisma/client"

export const getAktionstageDays = (): Day[] => {
  const env = process.env.NEXT_PUBLIC_AKTIONSTAGE_DAYS
  if (!env) throw new Error("Missing NEXT_PUBLIC_AKTIONSTAGE_DAYS in .env")
  return env.split(",").map((d) => d.trim().toUpperCase() as Day)
}
