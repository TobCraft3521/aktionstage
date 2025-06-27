import { updateAccounts } from "@/lib/actions/import/account"
import { Role } from "@prisma/client"
import { QueryClient } from "@tanstack/react-query"
import md5 from "md5"
import Papa from "papaparse"
import toast from "react-hot-toast"

export const importAccounts = async (
  file: File,
  queryClient: QueryClient,
  add?: boolean
) => {
  Papa.parse(file, {
    header: true,
    complete: (res) =>
      toast.promise(onData(res, queryClient, add), {
        loading: add
          ? "Accounts werden hinzugefügt"
          : "Accounts werden importiert",
        success: (data) =>
          (data?.count && data?.count + " ") +
          "Accounts erfolgreich " +
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

  if (!res.meta.fields) throw new Error("Keine Spalten")
  if (
    // Id is optional
    !res.meta.fields.includes("Name") ||
    !res.meta.fields.includes("Klasse") ||
    !(
      // Either password or its hash
      (
        res.meta.fields.includes("Password_Hash") ||
        res.meta.fields.includes("Password")
      )
    ) ||
    // [Initial_Password_Hash is optional]
    // [Projekte is optional]
    !res.meta.fields.includes("Rolle")
    // [Kürzel is optional]
  ) {
    throw new Error("Falsche Spalten")
  }
  let accounts: any

  try {
    // Overwrite database entries
    accounts = // ImportedAccounts
      data
        .map((d) => {
          return {
            ...(d.Id?.length > 0 && { id: d.Id }),
            name: d.Name,
            grade: d.Klasse,
            password:
              d.Password_Hash !== undefined
                ? d.Password_Hash
                : md5(d.Password || ""),
            initialPassword:
              d.Initial_Password_Hash !== undefined
                ? d.Initial_Password_Hash
                : d.Password
                ? md5(d.Password)
                : "",
            projectIds:
              d.Projekte?.length > 0 ? d.Projekte?.split(",") || [] : [],
            userName: d.Name?.split(" ").join("."),
            role:
              (lookUpVip[d.Name] && Role.VIP) ??
              (Role[d.Rolle as Role] || Role.STUDENT),
            short: d["Kürzel"] || "",
          }
        })
        // Filter out empty entries
        .filter((a) => a.name)
  } catch (error) {
    console.error(error)
    throw new Error("Fehler beim Verarbeiten der Daten")
  }
  const result = await updateAccounts(accounts, add || false)

  queryClient.invalidateQueries({
    queryKey: ["teachers"],
  })

  queryClient.invalidateQueries({
    queryKey: ["students"],
  })

  if (result?.error) {
    throw new Error("Fehler beim Speichern")
  }
  return {
    count: result?.amount,
  }
}

const lookUpVip: Record<string, boolean> = {
  "Mika Sonntag" : true,
  "Michael Pawlik": true,
  "Tobias Hackenberg": true,
  "Peter Häußler": true,
  "Sebastian Zillner": true,
  "Elisa Granitzer": true,
  "Alexa Zimmermann": true,
  "Thomas Kopfinger": true,
  "Raffael Kellermann": true,
  "Niklas Stockinger": true,
}
