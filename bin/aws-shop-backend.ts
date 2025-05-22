#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { ProductServiceStack } from "../lib/product-service/product-service-stack";
import { ImportServiceStack } from "../lib/import-service/product-service-stack";
import { SharedInfraStack } from "../lib/shared/shared-infra-stack";

dotenv.config();

const app = new cdk.App();

const sharedInfra = new SharedInfraStack(app, "SharedInfraStack");

new ProductServiceStack(app, "ProductServiceStack", {
  queue: sharedInfra.queue,
});

new ImportServiceStack(app, "ImportServiceStack", {
  queue: sharedInfra.queue,
});
