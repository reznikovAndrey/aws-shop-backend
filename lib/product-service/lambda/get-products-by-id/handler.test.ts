import { getProductsById } from "./handler";
import { NOT_FOUND } from "../constant";
import { MOCKED_PRODUCTS } from "../mock";

describe("getProductById", () => {
  it("should return product", async () => {
    const actual = await getProductsById({ productId: "1" });
    expect(actual).toStrictEqual(MOCKED_PRODUCTS[0]);
  });

  it("should throw an error", async () => {
    return expect(getProductsById({ productId: "6" })).rejects.toThrow(
      NOT_FOUND,
    );
  });
});
