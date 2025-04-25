import { getProduct } from "../mock";
import { Product } from "../types";

export async function getProductsById({
  productId,
}: {
  productId: Product["id"];
}) {
  const product = await getProduct(productId);

  if (product === null) {
    throw new Error(`NotFound`);
  }

  return product;
}
