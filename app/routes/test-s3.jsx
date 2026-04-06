import { uploadWebhookPayloadToS3 } from "../models/s3.server";

export const loader = async () => {
  try {
    const key = await uploadWebhookPayloadToS3({
      shop: "test-shop.myshopify.com",
      topic: "orders/create",
      payload: {
        id: 123456789,
        test: true,
        message: "Hello from test-s3 route",
      },
    });

    console.log("S3 TEST SUCCESS:", key);
    return new Response(`S3 upload success: ${key}`, { status: 200 });
  } catch (error) {
    console.error("S3 TEST FAILED:", error);
    return new Response(`S3 upload failed: ${error.message}`, { status: 500 });
  }
};