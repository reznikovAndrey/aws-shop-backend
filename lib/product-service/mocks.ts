import { ProductDTO, StockDTO } from "./types";
import { v4 } from "uuid";

export const PRODUCT_LIST_MOCK: ProductDTO[] = [
  {
    id: v4(),
    title: "Wireless Headphones",
    description: "Noise-cancelling over-ear wireless headphones.",
    price: 129.99,
  },
  {
    id: v4(),
    title: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with blue switches.",
    price: 89.5,
  },
  {
    id: v4(),
    title: "Gaming Mouse",
    description: "Ergonomic gaming mouse with customizable DPI.",
    price: 49.99,
  },
  {
    id: v4(),
    title: "4K Monitor",
    description: "27-inch 4K UHD monitor with HDR support.",
    price: 299.99,
  },
  {
    id: v4(),
    title: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, and card reader.",
    price: 39.99,
  },
];

export const STOCKS_LIST_MOCK: StockDTO[] = PRODUCT_LIST_MOCK.map(
  ({ id }, i) => ({
    product_id: id,
    count: i + 1,
  }),
);
