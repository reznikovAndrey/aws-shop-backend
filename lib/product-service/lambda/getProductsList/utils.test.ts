import { mergeData } from "./utils";

describe("mergeData", () => {
  it("should merge data", () => {
    const res = mergeData(
      [
        {
          id: "1",
          description: "description 1",
          price: 1,
          title: "title 1",
        },
        {
          id: "2",
          description: "description 2",
          price: 2,
          title: "title 2",
        },
      ],
      [
        { product_id: "1", count: 20 },
        { product_id: "2", count: 10 },
      ],
    );

    expect(res).toEqual([
      {
        id: "1",
        description: "description 1",
        price: 1,
        title: "title 1",
        count: 20,
      },
      {
        id: "2",
        description: "description 2",
        price: 2,
        title: "title 2",
        count: 10,
      },
    ]);
  });
});
