import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 } from "uuid";
import { getDynamoDBClient } from "../shared/utils";
import { INVALID_PAYLOAD, SERVER_ERROR } from "../shared/constant";
import { isPayloadValid } from "./utils.";

const client = getDynamoDBClient();

export async function createProduct(payload: unknown) {
  const productId = v4();

  console.log("createProduct request", payload);

  try {
    const isValid = isPayloadValid(payload);

    if (!isValid) {
      throw new Error(INVALID_PAYLOAD);
    }

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

    // @ts-expect-error
    if (err?.message === INVALID_PAYLOAD) {
      throw new Error(INVALID_PAYLOAD);
    }

    throw new Error(SERVER_ERROR);
  }
}
