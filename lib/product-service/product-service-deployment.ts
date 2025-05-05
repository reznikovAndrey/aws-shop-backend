import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { LAMBDA_FOLDER_PATH, PRODUCT_ID_KEY } from "./constant";
import { NOT_FOUND, SERVER_ERROR } from "./lambda/shared/constant";

export class ProductServiceDeployment extends Construct {
  productsTable: dynamodb.ITable;
  stocksTable: dynamodb.ITable;

  constructor(scope: Construct, id: string) {
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

    const api = new apigateway.RestApi(this, "product-service-api", {
      restApiName: "Product Service API gateway",
      description: "This API serves this Lambda functions",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET"],
      },
    });

    const getProductsListLambda = this.createLambda("getProductsList");
    const getProductsByIdLambda = this.createLambda("getProductsById");

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: { "application/json": "$input.json('$')" },
            responseParameters: this.configureIntegrationResponseParameters(),
          },
          {
            statusCode: "500",
            selectionPattern: `.*${SERVER_ERROR}*.`,
            responseTemplates: {
              "application/json": JSON.stringify({
                message: "Server error",
              }),
            },
            responseParameters: this.configureIntegrationResponseParameters(),
          },
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
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": "$input.json('$')",
            },
            responseParameters: this.configureIntegrationResponseParameters(),
          },
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
        ],
      },
    );

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", getProductsListLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: this.configureMethodResponseParameters(),
        },
        {
          statusCode: "500",
          responseParameters: this.configureMethodResponseParameters(),
        },
      ],
    });

    const productByIdResource = productsResource.addResource(
      `{${PRODUCT_ID_KEY}}`,
    );
    productByIdResource.addMethod("GET", getProductByIdLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: this.configureMethodResponseParameters(),
        },
        {
          statusCode: "404",
          responseParameters: this.configureMethodResponseParameters(),
        },
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
