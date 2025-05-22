import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { PRODUCT_ID_KEY, SQS_BATCH_SIZE } from "./constant";
import {
  INVALID_PAYLOAD,
  NOT_FOUND,
  SERVER_ERROR,
} from "./lambda/shared/constant";
import { LAMBDA_FOLDER_PATH } from "../shared/constant";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { StackProps } from "../shared/types";

// TODO: handle errors with classes from 'shared/error.ts'
// TODO: remove lambda/shared folder
export class ProductServiceDeployment extends Construct {
  productsTable: dynamodb.ITable;
  stocksTable: dynamodb.ITable;
  api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    this.productsTable = dynamodb.Table.fromTableName(
      this,
      "ImportedProductsTable",
      process.env.PRODUCTS_TABLE_NAME as string,
    );

    this.stocksTable = dynamodb.Table.fromTableName(
      this,
      "ImportedStocksTable",
      process.env.STOCKS_TABLE_NAME as string,
    );

    this.api = new apigateway.RestApi(this, "product-service-api", {
      restApiName: "Product Service API gateway",
      description: "This API serves this Lambda functions",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST"],
      },
    });

    const getProductsListLambda = this.createLambda("getProductsList");
    const getProductsByIdLambda = this.createLambda("getProductsById");
    const createProductLambda = this.createLambda("createProduct");
    const catalogBatchProcessLambda = this.createLambda("catalogBatchProcess");

    catalogBatchProcessLambda.addEventSource(
      new SqsEventSource(props.queue, { batchSize: SQS_BATCH_SIZE }),
    );

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda,
      {
        proxy: false,
        integrationResponses: [
          this.configureIntegrationResponseHTTP200(),
          this.configureIntegrationResponseHTTP500(),
        ],
      },
    );
    const getProductByIdLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambda,
      {
        proxy: false,
        requestTemplates: {
          "application/json": JSON.stringify({
            productId: `$input.params('${PRODUCT_ID_KEY}')`,
          }),
        },
        integrationResponses: [
          this.configureIntegrationResponseHTTP200(),
          {
            statusCode: "404",
            selectionPattern: `.*${NOT_FOUND}*.`,
            responseTemplates: {
              "application/json": JSON.stringify({
                message: "Product not found",
              }),
            },
            responseParameters: this.configureIntegrationResponseParameters(),
          },
          this.configureIntegrationResponseHTTP500(),
        ],
      },
    );
    const createProductLambdaIntegration = new apigateway.LambdaIntegration(
      createProductLambda,
      {
        proxy: false,
        requestTemplates: {
          "application/json": "$input.body",
        },
        integrationResponses: [
          this.configureIntegrationResponseHTTP200(),
          {
            statusCode: "400",
            selectionPattern: `.*${INVALID_PAYLOAD}*.`,
            responseTemplates: {
              "application/json": JSON.stringify({
                message: "Invalid payload",
              }),
            },
          },
          this.configureIntegrationResponseHTTP500(),
        ],
      },
    );

    const productsResource = this.api.root.addResource("products");
    productsResource.addMethod("GET", getProductsListLambdaIntegration, {
      methodResponses: [
        this.configureMethodResponseHTTP200(),
        this.configureMethodResponseHTTP500(),
      ],
    });
    productsResource.addMethod("POST", createProductLambdaIntegration, {
      methodResponses: [
        this.configureMethodResponseHTTP200(),
        {
          statusCode: "400",
          responseParameters: this.configureMethodResponseParameters(),
        },
        this.configureMethodResponseHTTP500(),
      ],
    });

    const productByIdResource = productsResource.addResource(
      `{${PRODUCT_ID_KEY}}`,
    );
    productByIdResource.addMethod("GET", getProductByIdLambdaIntegration, {
      methodResponses: [
        this.configureMethodResponseHTTP200(),
        {
          statusCode: "404",
          responseParameters: this.configureMethodResponseParameters(),
        },
        this.configureMethodResponseHTTP500(),
      ],
    });
  }

  private createLambda(name: string) {
    const lambdaFn = new lambdaNodejs.NodejsFunction(this, name, {
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: name,
      entry: path.join(__dirname, LAMBDA_FOLDER_PATH, name, "handler.ts"),
      environment: {
        PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME as string,
        STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME as string,
      },
    });

    this.productsTable.grantReadWriteData(lambdaFn);
    this.stocksTable.grantReadWriteData(lambdaFn);

    return lambdaFn;
  }

  private configureIntegrationResponseHTTP200(): apigateway.IntegrationResponse {
    return {
      statusCode: "200",
      responseTemplates: { "application/json": "$input.json('$')" },
      responseParameters: this.configureIntegrationResponseParameters(),
    };
  }

  private configureIntegrationResponseHTTP500(): apigateway.IntegrationResponse {
    return {
      statusCode: "500",
      selectionPattern: `.*${SERVER_ERROR}*.`,
      responseTemplates: {
        "application/json": JSON.stringify({
          message: "Server error",
        }),
      },
      responseParameters: this.configureIntegrationResponseParameters(),
    };
  }

  private configureMethodResponseHTTP200(): apigateway.MethodResponse {
    return {
      statusCode: "200",
      responseParameters: this.configureMethodResponseParameters(),
    };
  }

  private configureMethodResponseHTTP500(): apigateway.MethodResponse {
    return {
      statusCode: "500",
      responseParameters: this.configureMethodResponseParameters(),
    };
  }

  private configureIntegrationResponseParameters(): apigateway.IntegrationResponse["responseParameters"] {
    return {
      "method.response.header.Access-Control-Allow-Origin": "'*'",
      "method.response.header.Content-Type": "'application/json'",
    };
  }

  private configureMethodResponseParameters(): apigateway.MethodResponse["responseParameters"] {
    return {
      "method.response.header.Access-Control-Allow-Origin": true,
      "method.response.header.Content-Type": true,
    };
  }
}
