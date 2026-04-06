// app/models/s3.server.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadWebhookPayloadToS3({ shop, topic, payload }) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const timestamp = now.toISOString().replace(/[:.]/g, "-");

  const orderId = payload?.id || "unknown-order";
  const topicFolder = topic.toLowerCase().replace("/", "-");

  const key = `shopify/${shop}/${topicFolder}/${yyyy}/${mm}/${dd}/${orderId}-${timestamp}.json`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(payload, null, 2),
      ContentType: "application/json",
    })
  );

  return key;
}