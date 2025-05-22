import { SQSEvent } from "aws-lambda";
import { createProduct } from "../createProduct/handler";

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
    }
  });
}
