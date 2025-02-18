"use server"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { v4 as uuid } from "uuid"

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
})

export const serverSideUpload = async (file: File) => {
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${uuid()}.${file.type.split("/")[1]}`
  const { NEXT_AWS_BUCKET_NAME, NEXT_AWS_REGION } = process.env

  const params = {
    Bucket: NEXT_AWS_BUCKET_NAME!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: file.type,
    // ACL: "public-read",
  }

  try {
    const command = new PutObjectCommand(params)
    const uploadResult = await s3Client.send(command)
    const publicUrl = `https://${NEXT_AWS_BUCKET_NAME}.s3.${NEXT_AWS_REGION}.amazonaws.com/${fileName}`
    return { uploadResult, publicUrl, error: null }
  } catch (error) {
    return { uploadResult: null, publicUrl: "", error }
  }
}

export const getPresignedUploadPost = async (
  type: string
): Promise<{
  url: string
  fields: Record<string, string>
  publicUrl: string
  error: any | null
}> => {
  const { NEXT_AWS_BUCKET_NAME, NEXT_AWS_REGION } = process.env
  const Key = `${uuid()}.${type.split("/")[1]}`
  const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

  try {
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: NEXT_AWS_BUCKET_NAME!,
      Key,
      Fields: {
        "Content-Type": `${type}`,
        // "Content-Disposition": "inline", // fixed: content type was image/image/...
      },
      Conditions: [
        ["content-length-range", 0, MAX_UPLOAD_SIZE_BYTES], // Enforce file size limit
      ],
      Expires: 3600, // 1-hour expiration
    })

    // Generate the public URL
    const publicUrl = `https://${NEXT_AWS_BUCKET_NAME}.s3.${NEXT_AWS_REGION}.amazonaws.com/${Key}`

    return {
      url: presignedPost.url,
      fields: presignedPost.fields,
      publicUrl,
      error: null,
    }
  } catch (error) {
    return { url: "", fields: {}, publicUrl: "", error }
  }
}
