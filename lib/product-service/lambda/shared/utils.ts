import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export function getDynamoDBClient() {
  return new DynamoDBClient({
    region: process.env.AWS_REGION ?? undefined,
  });
}
