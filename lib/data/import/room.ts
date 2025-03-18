import { updateProjects } from "@/lib/actions/import/project"
import { updateRooms } from "@/lib/actions/import/room"
import { QueryClient } from "@tanstack/react-query"
import Papa from "papaparse"
import toast from "react-hot-toast"

export const importRooms = async (
  file: File,
  queryClient: QueryClient,
  add?: boolean
) => {
  Papa.parse(file, {
    header: true,
    complete: (res) =>
      toast.promise(onData(res, queryClient, add), {
        loading: add ? "Räume werden hinzugefügt" : "Räume werden importiert",
        success: (data) =>
          (data?.count && data?.count + " ") +
          "Räume erfolgreich " +
          (add ? "hinzugefügt" : "importiert"),
        error: (error) =>
          add
            ? `Fehler beim Hinzufügen: ${error}`
            : `Fehler beim Importieren: ${error}`,
      }),

    error: (err) => {
      console.error(err)
      toast.error("Fehler beim Einlesen der Datei")
    },
    encoding: "utf-8",
  })
}

const onData = async (
  res: Papa.ParseResult<any>,
  queryClient: QueryClient,
  add?: boolean
) => {
  const { data } = res

  // check headers, dimensions
  if (data.length === 0) {
    throw new Error("Keine Daten")
  }
  if (res.meta.fields?.length !== 3) {
    throw new Error("Falsche Anzahl an Spalten")
  }

  if (
    !res.meta.fields.includes("Id") ||
    !res.meta.fields.includes("Name") ||
    !res.meta.fields.includes("Projekte")
  ) {
    throw new Error("Falsche Spalten")
  }

  // Overwrite database entries
  const projects: any = // ImportedAccounts
    data
      .map((d) => {
        return {
          id: d.Id,
          name: d.Name,
          projectIds: d.Projekte.split(","),
        }
        // Filter out empty entries
      })
      .filter((a) => a.id)

  const result = await updateRooms(projects, add || false)

  queryClient.invalidateQueries({
    queryKey: ["rooms"],
  })

  if (result?.error) {
    throw new Error("Fehler beim Speichern")
  }
  return {
    count: result?.amount,
  }
}
