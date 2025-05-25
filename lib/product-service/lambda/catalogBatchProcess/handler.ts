import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { createProduct } from "../createProduct/handler";

const sns = new SNSClient({});

// TODO: add tests
export async function catalogBatchProcess(e: SQSEvent) {
  const results = await Promise.allSettled(
    e.Records.map(async (record) => {
      const payload = JSON.parse(record.body);
      return createProduct(payload);
    }),
  );

  results.forEach((result) => {
    switch (result.status) {
      case "rejected":
        console.log("Failed: ", result.reason);
        break;
      case "fulfilled":
        console.log("Success: ", result.value.productId);
        break;
    }
  });

  const createdProducts = results.filter((res) => res.status === "fulfilled");
  const shouldSendNotification = createdProducts.length;

  if (shouldSendNotification) {
    const command = new PublishCommand({
      TopicArn: process.env.TOPIC_ARN,
      Subject: "Products were created",
      Message: `Products with next ids were created: ${createdProducts
        .map((res) => res.value.productId)
        .join(", ")}`,
    });

    await sns.send(command);
  }
}
