import { NOT_FOUND, SERVER_ERROR } from "../shared/constant";
import { getProductsById } from "./handler";
import * as sharedUtils from "../shared/utils";

jest.mock("../shared/utils", () => ({
  __esModule: true,
  ...jest.requireActual("../shared/utils"),
  getDynamoDBClient: jest.fn().mockReturnValue({ send: jest.fn() }),
}));

describe("getProductById", () => {
  it("should return unexpected error", async () => {
    expect(getProductsById({ productId: "1" })).rejects.toThrow(SERVER_ERROR);
  });

  it("should return not found error", async () => {
    (sharedUtils.getDynamoDBClient().send as jest.Mock).mockReturnValue({
      Item: null,
    });

    expect(getProductsById({ productId: "1" })).rejects.toThrow(NOT_FOUND);
  });
});
