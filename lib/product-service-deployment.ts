import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as path from "path";

export class ProductServiceDeployment extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const api = new apigateway.RestApi(this, "product-service-api", {
      restApiName: "Product Service API gateway",
      description: "This API serves this Lambda functions",
      defaultCorsPreflightOptions: {
        // TODO: add frontend app url via env
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET"],
      },
    });

    const getProductsListLambda = new lambda.Function(
      this,
      "get-products-list",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "handler.getProductsList",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      },
    );

    const getProductsByIdLambda = new lambda.Function(
      this,
      "get-products-by-id",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "handler.getProductsById",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      },
    );

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: { "application/json": "$input.json('$')" },
            responseParameters: {
              // TODO: add frontend app url via env
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Content-Type": "'application/json'",
            },
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
            productId: "$input.params('product_id')",
          }),
        },
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": "$input.json('$')",
            },
            responseParameters: {
              // TODO: add frontend app url via env
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Content-Type": "'application/json'",
            },
          },
          {
            statusCode: "404",
            selectionPattern: ".*NotFound*.",
            responseTemplates: {
              "application/json": JSON.stringify({
                message: "Product not found",
              }),
            },
            responseParameters: {
              // TODO: add frontend app url via env
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Content-Type": "'application/json'",
            },
          },
        ],
      },
    );

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", getProductsListLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Content-Type": true,
          },
        },
      ],
    });

    const productByIdResource = productsResource.addResource("{product_id}");
    productByIdResource.addMethod("GET", getProductByIdLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Content-Type": true,
          },
        },
        {
          statusCode: "404",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Content-Type": true,
          },
        },
      ],
    });
  }
}
