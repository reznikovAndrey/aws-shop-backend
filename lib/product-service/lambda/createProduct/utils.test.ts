import { isPayloadValid } from "./utils.";
import { ProductCreatePayload } from "./types";

describe("isPayloadValid", () => {
  const payload: ProductCreatePayload = {
    price: 1,
    description: "description",
    title: "title",
    count: 10,
  };

  it("should be falsy", () => {
    expect(isPayloadValid({})).toBeFalsy();
    expect(isPayloadValid({ a: 1 })).toBeFalsy();
    expect(isPayloadValid({ price: payload.price })).toBeFalsy();
    expect(isPayloadValid({ price: payload.description })).toBeFalsy();
  });

  it("should be truthy", () => {
    expect(isPayloadValid(payload)).toBeTruthy();
  });
});
