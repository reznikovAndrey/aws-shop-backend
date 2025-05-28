import { Queue } from "aws-cdk-lib/aws-sqs";
import { StackProps as DefaultStackProps } from "aws-cdk-lib";

export type StackProps = DefaultStackProps & {
  queue: Queue;
};
