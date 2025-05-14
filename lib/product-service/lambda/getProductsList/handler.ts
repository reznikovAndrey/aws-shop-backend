import { ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  getDynamoDBClient,
  normalizeProductData,
  normalizeStockData,
} from "../shared/utils";
import { mergeData } from "./utils";
import { SERVER_ERROR } from "../shared/constant";
import { ProductDTO, StockDTO } from "../../types";

const client = getDynamoDBClient();

export async function getProductsList(e: unknown) {
  console.log("getProductsList", e);

  try {
    const [productsRes, stocksRes] = await Promise.all([
      client.send(
        new ScanCommand({ TableName: process.env.PRODUCTS_TABLE_NAME }),
      ),
      client.send(
        new ScanCommand({ TableName: process.env.STOCKS_TABLE_NAME }),
      ),
    ]);

    const productsData = (productsRes?.Items?.map(normalizeProductData) ??
      []) as ProductDTO[];

    const stocksData = (stocksRes?.Items?.map(normalizeStockData) ??
      []) as StockDTO[];

    return mergeData(productsData, stocksData);
  } catch (err) {
    console.error(err);
    throw new Error(SERVER_ERROR);
  }
}
