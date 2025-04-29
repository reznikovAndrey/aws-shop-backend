import { getProduct } from "../shared/mock";
import { Product } from "../shared/types";
import { NOT_FOUND } from "../shared/constant";

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
