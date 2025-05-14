import { ProductDTO, StockDTO } from "../../types";

export type Product = ProductDTO & Pick<StockDTO, "count">;
