import { authenticate } from "../shopify.server";
import { uploadWebhookPayloadToS3 } from "../models/s3.server";

export const action = async ({ request }) => {
  console.log("=== ORDERS FULFILLED ROUTE HIT ===");

  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    console.log("Webhook received:", {
      topic,
      shop,
      orderId: payload?.id,
    });

    const key = await uploadWebhookPayloadToS3({
      shop,
      topic,
      payload,
    });

    console.log("Uploaded to S3:", key);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response(`Error: ${error?.message || "Unknown error"}`, {
      status: 500,
    });
  }
};