import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import { FILENAME_KEY } from "./constant";
import { LAMBDA_FOLDER_PATH } from "../shared/constant";
import { FILES_UPLOAD_DIR_NAME } from "./lambda/importProductsFile/constant";
import { ApiErrors } from "../shared/error";
import { StackProps } from "../shared/types";

export class ImportServiceDeployment extends Construct {
  api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "import-service-bucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
      versioned: true,
    });

    new s3Deploy.BucketDeployment(this, "import-service-bucket-deployment", {
      destinationBucket: bucket,
      destinationKeyPrefix: `${FILES_UPLOAD_DIR_NAME}/`,
      sources: [s3Deploy.Source.data(".keep", "")],
    });

    this.api = new apigateway.RestApi(this, "import-service-api", {
      restApiName: "Import Service API gateway",
      description: "This API serves this Lambda functions",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET"],
      },
    });

    const importProductsFileLambda = new lambdaNodejs.NodejsFunction(
      this,
      "importProductsFile",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "importProductsFile",
        entry: path.join(
          __dirname,
          LAMBDA_FOLDER_PATH,
          "importProductsFile",
          "handler.ts",
        ),
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      },
    );

    const importProductsFileLambdaIntegration =
      new apigateway.LambdaIntegration(importProductsFileLambda, {
        proxy: false,
        requestTemplates: {
          "application/json": JSON.stringify({
            fileName: `$input.params('${FILENAME_KEY}')`,
          }),
        },
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: { "application/json": "$input.json('$')" },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Content-Type": "'application/json'",
            },
          },
          {
            statusCode: "400",
            selectionPattern: `${ApiErrors.BAD_REQUEST}*.`,
            responseTemplates: {
              "application/json": JSON.stringify({
                error: "Bad request: $input.path('$.errorMessage')",
              }),
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Content-Type": "'application/json'",
            },
          },
        ],
      });

    const importResource = this.api.root.addResource("import");
    importResource.addMethod("GET", importProductsFileLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Content-Type": true,
          },
        },
        {
          statusCode: "400",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Content-Type": true,
          },
        },
      ],
    });

    bucket.grantPut(importProductsFileLambda);

    const importFileParserLambda = new lambdaNodejs.NodejsFunction(
      this,
      "importFileParser",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "importFileParser",
        entry: path.join(
          __dirname,
          LAMBDA_FOLDER_PATH,
          "importFileParser",
          "handler.ts",
        ),
        environment: {
          QUEUE_URL: props.queue.queueUrl,
        },
      },
    );

    bucket.grantReadWrite(importFileParserLambda);
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: `${FILES_UPLOAD_DIR_NAME}/` },
    );

    props.queue.grantSendMessages(importFileParserLambda);
  }
}
