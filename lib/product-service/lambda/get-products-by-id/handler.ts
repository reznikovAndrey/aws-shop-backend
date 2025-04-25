import { getProduct } from "../mock";
import { Product } from "../types";
import { NOT_FOUND } from "../constant";

export async function getProductsById({
  productId,
}: {
  productId: Product["id"];
}) {
  const product = await getProduct(productId);

  if (product === null) {
    throw new Error(NOT_FOUND);
  }

  return product;
}
