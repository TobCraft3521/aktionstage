export async function isValidImage(url: string): Promise<boolean> {
  const proxyUrl = "https://proxy.cors.sh/"
  const fullUrl = proxyUrl + url

  try {
    const res = await fetch(fullUrl, { method: "HEAD" })
    const contentType = res.headers.get("content-type")
    return (res.ok && contentType?.startsWith("image/")) || false
  } catch (error) {
    console.error("Image validation failed:", error)
    return false
  }
}
