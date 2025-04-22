import { APIGatewayEvent } from "aws-lambda";

import { getProduct, getProducts } from "./mock";
import { Product } from "./types";

export async function getProductsList() {
  const products = await getProducts();

  return {
    body: JSON.stringify(products),
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-type",
      "Access-Control-Allow-Methods": "GET",
      // TODO: add url instead of *
      "Access-Control-Allow-Origin": "*",
    },
  };
}

export async function getProductsById(
  e: APIGatewayEvent & { productId?: Product["id"] },
) {
  const product = await getProduct(
    e.pathParameters?.["product_id"] ?? e.productId ?? "",
  );

  return {
    body: JSON.stringify(product),
    statusCode: product ? 200 : 404,
    headers: {
      "Access-Control-Allow-Headers": "Content-type",
      "Access-Control-Allow-Methods": "GET",
      // TODO: add url instead of *
      "Access-Control-Allow-Origin": "*",
    },
  };
}
