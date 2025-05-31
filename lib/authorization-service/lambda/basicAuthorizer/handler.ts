import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { UnauthorizedError } from "../../../shared/error";
import { BASIC_AUTH_HEADER_STARTS_WITH } from "./constant";

export async function basicAuthorizer(
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> {
  const authHeader = event.authorizationToken;

  if (!authHeader || !authHeader.startsWith(BASIC_AUTH_HEADER_STARTS_WITH)) {
    throw new UnauthorizedError();
  }

  const encodedCredentials = authHeader.split(" ")[1];
  const decoded = Buffer.from(encodedCredentials, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  const expectedPassword = process.env[username];

  if (!expectedPassword || expectedPassword !== password) {
    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      },
    };
  }

  return {
    principalId: username,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn,
        },
      ],
    },
  };
}
