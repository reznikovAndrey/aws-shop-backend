import { getDynamoDBClient } from "../shared/utils";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { mergeData, normalizeProductsData, normalizeStocksData } from "./utils";
import { SERVER_ERROR } from "../shared/constant";

const client = getDynamoDBClient();

export async function getProductsList() {
  try {
    const [productsRes, stocksRes] = await Promise.all([
      client.send(
        new ScanCommand({ TableName: process.env.PRODUCTS_TABLE_NAME }),
      ),
      client.send(
        new ScanCommand({ TableName: process.env.STOCKS_TABLE_NAME }),
      ),
    ]);

    const productsData = normalizeProductsData(productsRes.Items);
    const stocksData = normalizeStocksData(stocksRes.Items);

    return mergeData(productsData, stocksData);
  } catch (err) {
    console.error(err);
    throw new Error(SERVER_ERROR);
  }
}
