import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";
import { PRODUCT_LIST_MOCK, STOCKS_LIST_MOCK } from "./mocks";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? undefined,
});

async function seed() {
  try {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [process.env.PRODUCTS_TABLE_NAME as string]: PRODUCT_LIST_MOCK.map(
          (product) => ({
            PutRequest: {
              Item: {
                id: { S: product.id },
                title: { S: product.title },
                description: { S: product.description },
                price: { N: product.price.toString() },
              },
            },
          }),
        ),
        [process.env.STOCKS_TABLE_NAME as string]: STOCKS_LIST_MOCK.map(
          (stock) => ({
            PutRequest: {
              Item: {
                product_id: { S: stock.product_id },
                count: { S: stock.count.toString() },
              },
            },
          }),
        ),
      },
    });

    const res = await client.send(command);
    console.log("Seed complete:", res);
  } catch (err) {
    console.error("Seed failed:", err);
  }
}

seed();
