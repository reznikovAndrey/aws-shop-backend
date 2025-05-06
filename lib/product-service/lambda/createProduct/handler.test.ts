import { INVALID_PAYLOAD, SERVER_ERROR } from "../shared/constant";
import { createProduct } from "./handler";
import { ProductCreatePayload } from "./types";

jest.mock("../shared/utils", () => ({
  __esModule: true,
  ...jest.requireActual("../shared/utils"),
  getDynamoDBClient: jest.fn(),
}));

describe("createProduct", () => {
  it("should return unexpected error", async () => {
    const payload: ProductCreatePayload = {
      price: 1,
      description: "description",
      title: "title",
      count: 10,
    };
    expect(createProduct(payload)).rejects.toThrow(SERVER_ERROR);
  });

  it("should return invalid payload error", async () => {
    expect(createProduct({})).rejects.toThrow(INVALID_PAYLOAD);
  });
});
