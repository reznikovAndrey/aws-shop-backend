#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { ProductServiceStack } from "../lib/product-service/product-service-stack";
import { ImportServiceStack } from "../lib/import-service/import-service-stack";
import { SharedInfraStack } from "../lib/shared/shared-infra-stack";
import { AuthorizationServiceStack } from "../lib/authorization-service/authorization-service-stack";

dotenv.config();

const app = new cdk.App();

const sharedInfra = new SharedInfraStack(app, "SharedInfraStack");

const auth = new AuthorizationServiceStack(
  app,
  "AuthorizationServiceStack",
  {},
);

new ProductServiceStack(app, "ProductServiceStack", {
  queue: sharedInfra.queue,
});

new ImportServiceStack(app, "ImportServiceStack", {
  queue: sharedInfra.queue,
  basicAuthorizer: auth.basicAuthorizer,
});
