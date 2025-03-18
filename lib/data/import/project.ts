import { updateProjects } from "@/lib/actions/import/project"
import { QueryClient } from "@tanstack/react-query"
import Papa from "papaparse"
import toast from "react-hot-toast"

export const importProjects = async (
  file: File,
  queryClient: QueryClient,
  add?: boolean
) => {
  Papa.parse(file, {
    header: true,
    complete: (res) =>
      toast.promise(onData(res, queryClient, add), {
        loading: add
          ? "Projekte werden hinzugefügt"
          : "Projekte werden importiert",
        success: (data) =>
          (data?.count && data?.count + " ") +
          "Projekte erfolgreich " +
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
    console.log(1)
    throw new Error("Keine Daten")
  }
  if (res.meta.fields?.length !== 13) {
    console.log(2)

    throw new Error("Falsche Anzahl an Spalten")
  }

  if (
    !res.meta.fields.includes("Id") ||
    !res.meta.fields.includes("Titel") ||
    !res.meta.fields.includes("Beschreibung") ||
    !res.meta.fields.includes("Banner") ||
    !res.meta.fields.includes("Emoji") ||
    !res.meta.fields.includes("Tag") ||
    !res.meta.fields.includes("Uhrzeit") ||
    !res.meta.fields.includes("Ort") ||
    !res.meta.fields.includes("Preis") ||
    !res.meta.fields.includes("Maximale Schüler") ||
    !res.meta.fields.includes("Minimale Klasse") ||
    !res.meta.fields.includes("Maximale Klasse") ||
    !res.meta.fields.includes("Teilnehmer")
  ) {
    console.log(3)

    throw new Error("Falsche Spalten")
  }

  // Overwrite database entries
  const projects: any = // ImportedAccounts
    data
      .map((d) => {
        return {
          id: d.Id,
          name: d.Titel,
          description: d.Beschreibung,
          imageUrl: d.Banner,
          emoji: d.Emoji,
          day: d.Tag,
          time: d.Uhrzeit,
          location: d.Ort,
          price: parseFloat(d.Preis),
          maxStudents: parseInt(d["Maximale Schüler"]),
          minGrade: parseInt(d["Minimale Klasse"]),
          maxGrade: parseInt(d["Maximale Klasse"]),
          participantIds: d.Teilnehmer.split(","),
        }
        // Filter out empty entries
      })
      .filter((a) => a.id)

  const result = await updateProjects(projects, add || false)

  queryClient.invalidateQueries({
    queryKey: ["projects"],
  })

  if (result?.error) {
    throw new Error("Fehler beim Speichern")
  }
  return {
    count: result?.amount,
  }
}
