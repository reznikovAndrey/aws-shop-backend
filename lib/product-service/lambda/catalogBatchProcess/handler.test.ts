import { SQSRecord } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { catalogBatchProcess } from "./handler";
import { createProduct } from "../createProduct/handler";

const snsMock = mockClient(SNSClient);

jest.mock("../createProduct/handler", () => ({
  __esModule: true,
  ...jest.requireActual("../createProduct/handler"),
  createProduct: jest
    .fn()
    .mockReturnValue(
      new Promise((resolve) => resolve({ productId: "random-product-id" })),
    ),
}));

beforeEach(() => snsMock.reset());

const testData: Pick<SQSRecord, "body">[] = [
  {
    body: '{"title":"Wireless Headphones test 1","description":"High-quality Bluetooth headphones with noise cancellation.","price":89.99,"count":25}',
  },
];

// TODO: add tests for additional cases
describe("catalogBatchProcess", () => {
  it("should create product and send notification", async () => {
    snsMock.on(PublishCommand).resolves({ MessageId: "mocked-id" });

    // @ts-expect-error
    await catalogBatchProcess({ Records: testData });

    expect(createProduct as jest.Mock).toHaveBeenCalledWith(
      JSON.parse(testData[0].body),
    );

    expect(snsMock.calls()).toHaveLength(1);
  });
});
