import { PutObjectCommand } from "@aws-sdk/client-s3"
import { S3Client } from "@aws-sdk/client-s3"
import { v4 as uuid } from "uuid"

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_REGION || "eu-central-1",
  endpoint: process.env.NEXT_S3_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * Builds the correct public URL for a Supabase Storage object
 * @param key - The file path in the bucket (e.g., 'images/abc123.jpg')
 * @returns The public CDN URL or S3 endpoint as appropriate
 */
function buildPublicUrl(key: string): string {
  const endpoint = process.env.NEXT_S3_ENDPOINT!;
  const bucket = process.env.NEXT_AWS_BUCKET_NAME!;
  
  // Extract project reference from endpoint
  const projectRef = endpoint
    .replace('https://', '')
    .replace('.supabase.co/storage/v1/s3', '');

  // For public CDN access (browser-accessible URLs)
  if (endpoint.includes('supabase.co')) {
    // Remove any path segments after the project ref
    return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/${key.replace(/^\//, '')}`;
  }

  // For AWS S3-compatible operations (SDK/internal use)
  return `${endpoint}/${bucket}/${key.replace(/^\//, '')}`;
}

export const replaceProjectBanner = async (file: File, publicUrl: string) => {
  const endpoint = process.env.NEXT_S3_ENDPOINT!
  const bucket = process.env.NEXT_AWS_BUCKET_NAME || ""
  const prefix = bucket ? `${endpoint}/${bucket}/` : `${endpoint}/`

  let key: string
  if (publicUrl.startsWith(prefix)) {
    key = publicUrl.slice(prefix.length)
  } else {
    key = `${uuid()}.${file.type.split("/")[1]}`
    publicUrl = buildPublicUrl(key)
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const params = {
    Bucket: bucket || undefined,
    Key: key,
    Body: fileBuffer,
    ContentType: file.type,
  }

  try {
    await s3Client.send(new PutObjectCommand(params))
    return { publicUrl, error: null }
  } catch (error) {
    return { publicUrl: "", error }
  }
}
