import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ImportServiceDeployment } from "./import-service-deployment";
import { StackProps } from "../shared/types";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export class ImportServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & {
      basicAuthorizer: IFunction;
    },
  ) {
    super(scope, id, props);

    new ImportServiceDeployment(this, "import-service-deployment", props);
  }
}
