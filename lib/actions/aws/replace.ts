import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { v4 as uuid } from "uuid"

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
})

export const replaceProjectBanner = async (file: File, publicUrl: string) => {
  const { NEXT_AWS_BUCKET_NAME, NEXT_AWS_REGION } = process.env

  // Extract the key from the full public URL (e.g., https://your-bucket-name.s3.region.amazonaws.com/23984sfhdlshd.png)
  // Or generate a new one if the URL was external
  let key
  if (
    /^https:\/\/[a-zA-Z0-9\-]+\.s3\.[a-zA-Z0-9\-]+\.amazonaws\.com\//.test(
      publicUrl
    )
  ) {
    key = publicUrl.split("/").pop() // This gives you the file name (e.g., 23984sfhdlshd.png)
  } else {
    // For the new file
    key = `${uuid()}.${file.type.split("/")[1]}`
    publicUrl = `https://${NEXT_AWS_BUCKET_NAME}.s3.${NEXT_AWS_REGION}.amazonaws.com/${key}`
  }

  // Upload the new file to the same key (this overwrites the existing file)
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const uploadParams = {
    Bucket: NEXT_AWS_BUCKET_NAME!,
    Key: key!,
    Body: fileBuffer,
    ContentType: file.type,
  }

  try {
    await s3Client.send(new PutObjectCommand(uploadParams))
    // In case there was none before, return the new public URL
    return { publicUrl, error: null }
  } catch (error) {
    return { publicUrl: "", error }
  }
}
