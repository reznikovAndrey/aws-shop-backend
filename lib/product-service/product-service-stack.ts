import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ProductServiceDeployment } from "./product-service-deployment";
import { StackProps } from "../shared/types";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new ProductServiceDeployment(this, "product-service-deployment", props);
  }
}
