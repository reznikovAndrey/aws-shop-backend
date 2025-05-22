import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class SharedInfraStack extends cdk.Stack {
  public readonly queue: sqs.Queue;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.queue = new sqs.Queue(this, "shared-sqs-id", {
      queueName: process.env.SQS_NAME,
    });
  }
}
