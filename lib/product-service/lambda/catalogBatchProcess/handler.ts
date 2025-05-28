import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { createProduct } from "../createProduct/handler";

const sns = new SNSClient({});

// TODO: add tests
export async function catalogBatchProcess(e: SQSEvent) {
  const results = await Promise.allSettled(
    e.Records.map(async (record) => {
      const payload = JSON.parse(record.body);
      const { productId } = await createProduct(payload);
      const command = new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Subject: "Product was created",
        Message: `Product with next id was created: ${productId}`,
        MessageAttributes: {
          price: {
            DataType: "Number",
            StringValue: payload.price.toString(),
          },
        },
      });
      await sns.send(command);
      return productId;
    }),
  );

  results.forEach((result) => {
    switch (result.status) {
      case "rejected":
        console.log("Failed: ", result.reason);
        break;
      case "fulfilled":
        console.log("Success: ", result.value);
        break;
    }
  });
}
