import { Product } from "./types";

export const MOCKED_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    description: "Noise-cancelling over-ear wireless headphones.",
    price: 129.99,
    count: 15,
  },
  {
    id: "2",
    title: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with blue switches.",
    price: 89.5,
    count: 30,
  },
  {
    id: "3",
    title: "Gaming Mouse",
    description: "Ergonomic gaming mouse with customizable DPI.",
    price: 49.99,
    count: 25,
  },
  {
    id: "4",
    title: "4K Monitor",
    description: "27-inch 4K UHD monitor with HDR support.",
    price: 299.99,
    count: 10,
  },
  {
    id: "5",
    title: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, and card reader.",
    price: 39.99,
    count: 50,
  },
];

export function getProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCKED_PRODUCTS), 500);
  });
}

export function getProduct(id: Product["id"]): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(MOCKED_PRODUCTS.find((el) => el.id === id) ?? null),
      500,
    );
  });
}
