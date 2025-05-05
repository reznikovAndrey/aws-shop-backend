import { ProductDTO, StockDTO } from "../../types";
import { Product } from "../shared/types";
import { ScanCommandOutput } from "@aws-sdk/client-dynamodb";

export function mergeData(
  products: ProductDTO[],
  stocks: StockDTO[],
): Product[] {
  const stocksMap: Map<StockDTO["product_id"], StockDTO> = new Map();

  stocks.forEach((stock) => {
    stocksMap.set(stock.product_id, stock);
  });

  return products.map((product) => {
    const count = stocksMap.get(product.id)?.count;

    return { ...product, count: count ?? 0 };
  });
}

export function normalizeProductsData(
  data: ScanCommandOutput["Items"],
): ProductDTO[] {
  return (
    data?.map((product) => ({
      id: product.id.S as string,
      title: product.title.S as string,
      description: product.description.S as string,
      price: Number(product.price.N),
    })) ?? []
  );
}

export function normalizeStocksData(
  data: ScanCommandOutput["Items"],
): StockDTO[] {
  return (
    data?.map((stock) => ({
      product_id: stock.product_id.S as string,
      count: Number(stock.count.S),
    })) ?? []
  );
}
