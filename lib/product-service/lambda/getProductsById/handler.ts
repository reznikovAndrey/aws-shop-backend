import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { Product } from "../shared/types";
import {
  getDynamoDBClient,
  normalizeProductData,
  normalizeStockData,
} from "../shared/utils";
import { mergeData } from "./utils";
import { NOT_FOUND, SERVER_ERROR } from "../shared/constant";

const client = getDynamoDBClient();

export async function getProductsById({
  productId,
}: {
  productId: Product["id"];
}) {
  console.log("getProductsById request", productId);

  try {
    const commandToProductsTable = new GetItemCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: {
        id: { S: productId },
      },
    });

    const commandToStocksTable = new GetItemCommand({
      TableName: process.env.STOCKS_TABLE_NAME,
      Key: {
        product_id: { S: productId },
      },
    });

    const [productRes, stockRes] = await Promise.all([
      client.send(commandToProductsTable),
      client.send(commandToStocksTable),
    ]);

    const productItem = normalizeProductData(productRes.Item);
    const stockItem = normalizeStockData(stockRes.Item);

    const product = mergeData(productItem, stockItem);

    if (!product) {
      throw new Error(NOT_FOUND);
    }

    return product;
  } catch (err) {
    console.error(err);

    // @ts-expect-error
    if (err?.message === NOT_FOUND) {
      throw new Error(NOT_FOUND);
    }

    throw new Error(SERVER_ERROR);
  }
}
