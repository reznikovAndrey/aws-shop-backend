import * as presigner from "@aws-sdk/s3-request-presigner";
import { importProductsFile } from "./handler";
import { BadRequestError, ServerError } from "../../../shared/error";

jest.mock("@aws-sdk/s3-request-presigner");

describe("importProductsFile", () => {
  it("should throw bad request error", async () => {
    await expect(importProductsFile({})).rejects.toThrow(BadRequestError);
  });

  it("should throw server error", async () => {
    (presigner.getSignedUrl as jest.Mock).mockImplementationOnce(() => {
      throw new Error("");
    });

    await expect(importProductsFile({ fileName: "test" })).rejects.toThrow(
      ServerError,
    );
  });

  it("should call getSignedUrl method", async () => {
    (presigner.getSignedUrl as jest.Mock).mockReturnValue("test-url");

    await importProductsFile({ fileName: "test.txt" });
    expect(presigner.getSignedUrl).toHaveBeenCalled();
  });
});
