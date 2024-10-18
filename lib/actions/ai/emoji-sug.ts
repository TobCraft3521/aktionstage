"use server"
import { auth } from "@/lib/auth/auth"

export const suggestEmoji = async (text: string) => {
  const id = (await auth())?.user?.id
  if (!id) return null
  const response = await fetch(
    `https://emoji-ai.p.rapidapi.com/getEmoji?query=${encodeURIComponent(
      text
    )}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "emoji-ai.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch emoji suggestions")
  }

  const data = await response.json()
  return data
}
