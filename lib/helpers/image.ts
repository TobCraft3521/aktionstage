export async function isValidImage(url: string): Promise<boolean> {
  const proxyUrl = "https://proxy.cors.sh/"
  const fullUrl = proxyUrl + url

  try {
    const res = await fetch(fullUrl, {
      method: "HEAD",
      headers: {
        "x-cors-api-key": "temp_8b29c88d16e7e36dcbc08aae5fd8e4fa",
      },
    })
    const contentType = res.headers.get("content-type")
    return (res.ok && contentType?.startsWith("image/")) || false
  } catch (error) {
    console.error("Image validation failed:", error)
    return false
  }
}
