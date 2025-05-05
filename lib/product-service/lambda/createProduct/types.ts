import { Product } from "../shared/types";

export type ProductCreatePayload = Omit<Product, "id">;
