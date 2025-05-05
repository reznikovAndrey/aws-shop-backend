import { getProductsList } from "./handler";
import * as utils from "../shared/utils";
import { SERVER_ERROR } from "../shared/constant";

jest.mock("../shared/utils", () => ({
  getDynamoDBClient: jest.fn(),
}));

describe("getProductsList", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return server error in case of unexpected error", async () => {
    expect(getProductsList()).rejects.toThrow(SERVER_ERROR);
  });
});
