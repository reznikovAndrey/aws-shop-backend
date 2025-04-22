import { getProducts } from "./mock";

export async function getProductList() {
  const products = await getProducts();

  return {
    body: { products },
    statusCode: 200,
  };
}
