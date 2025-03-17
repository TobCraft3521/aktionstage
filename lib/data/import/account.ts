import { updateAccounts } from "@/lib/actions/import/account"
import { ImportedAccounts } from "@/lib/types"
import md5 from "md5"
import Papa from "papaparse"
import toast from "react-hot-toast"

export const importAccounts = async (file: File, add?: boolean) => {
  Papa.parse(file, {
    header: true,
    complete: (res) =>
      toast.promise(onData(res, add), {
        loading: add
          ? "Accounts werden hinzugefügt"
          : "Accounts werden importiert",
        success: "Accounts erfolgreich " + (add ? "hinzugefügt" : "importiert"),
        error: (error) =>
          add
            ? `Fehler beim Hinzufügen: ${error}`
            : `Fehler beim Importieren: ${error}`,
      }),

    error: (err) => {
      console.error(err)
      toast.error("Fehler beim Einlesen der Datei")
    },
  })
}

const onData = async (res: Papa.ParseResult<any>, add?: boolean) => {
  const { data } = res

  // check headers, dimensions
  if (data.length === 0) {
    console.log(1)
    throw new Error("Keine Daten")
  }
  if (res.meta.fields?.length !== 7) {
    console.log(2)

    throw new Error("Falsche Anzahl an Spalten")
  }

  if (
    !res.meta.fields.includes("Id") ||
    !res.meta.fields.includes("Name") ||
    !res.meta.fields.includes("Klasse") ||
    !(
      // Either password or its hash
      (
        res.meta.fields.includes("Password_Hash") ||
        res.meta.fields.includes("Password")
      )
    ) ||
    !res.meta.fields.includes("Projekte") ||
    !res.meta.fields.includes("Rolle") ||
    !res.meta.fields.includes("Kuerzel")
  ) {
    console.log(3)

    throw new Error("Falsche Spalten")
  }

  // Overwrite database entries
  const accounts: any = // ImportedAccounts
    data.map((d) => {
      return {
        id: d.Id,
        name: d.Name,
        grade: d.Klasse,
        password: d.Password_Hash ?? md5(d.Password),
        projectIds: d.Projekte?.split(",") || [],
        userName: d.Name?.split(" ").join("."),
        role: d.Rolle,
        short: d.Kuerzel,
      }
    })
  const result = await updateAccounts(accounts, add || false)
  if (result?.error) {
    throw new Error("Fehler beim Speichern")
  }
}
