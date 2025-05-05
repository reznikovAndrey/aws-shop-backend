import { NOT_FOUND, SERVER_ERROR } from "../shared/constant";
import * as sharedUtils from "../shared/utils";
import * as lambdaUtils from "./utils";
import { getProductsById } from "./handler";

jest.mock("../shared/utils", () => ({
  getDynamoDBClient: jest.fn(),
}));

jest.mock("./utils", () => ({
  mergeData: jest.fn(),
}));

describe("getProductById", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return server error in case of unexpected error", async () => {
    expect(getProductsById({ productId: "1" })).rejects.toThrow(SERVER_ERROR);
  });

  // TODO: fix
  // it("should return not found error if product was not found", async () => {
  //   (sharedUtils.getDynamoDBClient as jest.Mock).mockReturnValueOnce({
  //     send: jest.fn(),
  //   });
  //
  //   (lambdaUtils.mergeData as jest.Mock).mockImplementation(() => {
  //     throw new Error(NOT_FOUND);
  //   });
  //
  //   expect(getProductsById({ productId: "1" })).rejects.toThrow(NOT_FOUND);
  // });
});
