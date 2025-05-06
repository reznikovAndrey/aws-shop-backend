import { ProductCreatePayload } from "./types";

export function isPayloadValid(payload: any): payload is ProductCreatePayload {
  const isCountFieldValid =
    payload?.count !== undefined && typeof payload.count === "number";

  const isTitleFieldValid =
    payload.title !== undefined && typeof payload.title === "string";

  const isDescriptionFieldValid =
    payload.description !== undefined &&
    typeof payload.description === "string";

  const isPriceFieldValid =
    payload.price !== undefined && typeof payload.price === "number";

  return (
    isCountFieldValid &&
    isTitleFieldValid &&
    isDescriptionFieldValid &&
    isPriceFieldValid
  );
}
