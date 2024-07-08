"use server"

import { S3, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuid } from "uuid"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
const s3Client = new S3({
  region: process.env.NEXT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
})

export const getPresignedUploadURL = async (
  type: string
): Promise<{
  url: string | null
  error: any | null
  // only if upload successful
  futurePublicURL: string
}> => {
  const { NEXT_AWS_REGION, NEXT_AWS_BUCKET_NAME } = process.env
  const Key = `${uuid()}`
  const command = new PutObjectCommand({
    Bucket: NEXT_AWS_BUCKET_NAME!,
    Key,
    ContentType: "image/" + type,
  })
  const futurePublicURL = `https://${NEXT_AWS_BUCKET_NAME}.s3.${NEXT_AWS_REGION}.amazonaws.com/${Key}`
  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 })
    // console.log("Presigned URL: ", url)
    return { url, error: null, futurePublicURL }
  } catch (error) {
    return { url: null, error, futurePublicURL: "" }
  }
}
