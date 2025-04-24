import { getProduct, getProducts } from "./mock";

export async function getProductsList() {
  return getProducts();
}

export async function getProductsById({ productId }: { productId: string }) {
  const product = await getProduct(productId);

  if (product === null) {
    throw new Error(`NotFound`);
  }

  return product;
}
