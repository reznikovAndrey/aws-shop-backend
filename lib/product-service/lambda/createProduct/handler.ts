import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 } from "uuid";
import { getDynamoDBClient } from "../shared/utils";
import { ProductCreatePayload } from "./types";
import { SERVER_ERROR } from "../shared/constant";

const client = getDynamoDBClient();

// TODO: add tests
export async function createProduct(payload: ProductCreatePayload) {
  const productId = v4();

  // TODO: add validation

  try {
    const productsTableCommand = new PutItemCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: {
        id: { S: productId },
        title: { S: payload.title },
        description: { S: payload.description },
        price: { N: payload.price.toString() },
      },
    });

    await client.send(productsTableCommand);

    const stocksTableCommand = new PutItemCommand({
      TableName: process.env.STOCKS_TABLE_NAME,
      Item: {
        product_id: { S: productId },
        count: { S: payload.count.toString() },
      },
    });

    await client.send(stocksTableCommand);

    return { productId };
  } catch (err) {
    console.error(err);
    throw new Error(SERVER_ERROR);
  }
}
