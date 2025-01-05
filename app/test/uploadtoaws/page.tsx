"use client"

import { useState } from "react"
import { getPresignedUploadPost } from "@/lib/actions/aws/upload"

export default function FileUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cFile = e.target.files?.[0]

    if (!cFile) return
    setFile(cFile)

    // Check file size (limit to 5MB)
    const MAX_SIZE_MB = 5
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

    if (cFile.size > MAX_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_SIZE_MB} MB.`)
      return
    }

    setError(null)
    console.log("File is valid:", file)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Call the server action to get presigned POST data
      const {
        url,
        fields,
        publicUrl,
        error: serverError,
      } = await getPresignedUploadPost(file.type.split("/")[1])

      if (serverError) {
        setError("Failed to get upload URL.")
        console.error(serverError)
        setIsUploading(false)
        return
      }

      // Prepare form data
      const formData = new FormData()
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value) // Add all fields from presigned POST
      })
      formData.append("file", file) // Add the file

      // Perform the POST request
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        setError(`Upload failed: ${errorText}`)
        console.error("Upload failed:", errorText)
      } else {
        console.log("File uploaded successfully!")
        setUploadUrl(publicUrl)
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred during the upload.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h1 className="text-xl font-bold">Upload a File</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={isUploading || !file}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
      {uploadUrl && (
        <p className="text-green-600">
          File uploaded successfully! Public URL:{" "}
          <a href={uploadUrl} target="_blank" rel="noopener noreferrer">
            {uploadUrl}
          </a>
        </p>
      )}
    </div>
  )
}
