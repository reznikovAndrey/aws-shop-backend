import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ImportServiceDeployment } from "./import-service-deployment";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ImportServiceDeployment(this, "import-service-deployment");
  }
}
