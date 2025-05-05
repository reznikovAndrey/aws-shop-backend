import { mergeData } from "./utils";
import { ProductDTO, StockDTO } from "../../types";

describe("mergeData", () => {
  const product: ProductDTO = {
    id: "1",
    description: "description 1",
    title: "title 1",
    price: 1,
  };

  const stock: StockDTO = {
    product_id: "1",
    count: 11,
  };

  it("should return null", () => {
    const res = mergeData(null, null);
    expect(res).toBeNull();
  });

  it("should merge data", () => {
    const res = mergeData(product, stock);
    expect(res).toEqual({ ...product, count: stock.count });
  });

  it("should set default count value to 0 if no data", () => {
    const res = mergeData(product, null);
    expect(res).toEqual({ ...product, count: 0 });
  });
});
