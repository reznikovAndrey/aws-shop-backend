export type ProductDTO = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type StockDTO = {
  product_id: ProductDTO["id"];
  count: number;
};
