import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { Construct } from "constructs";
import { ProductServiceDeployment } from "./product-service-deployment";

dotenv.config();

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ProductServiceDeployment(this, "product-service-deployment");
  }
}
