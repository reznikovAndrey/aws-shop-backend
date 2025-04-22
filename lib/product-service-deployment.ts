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

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda,
      {},
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

    const getProductByIdLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambda,
      {},
    );

    const productsResource = api.root.addResource("products");

    productsResource.addMethod("GET", getProductsListLambdaIntegration);

    const productByIdResource = productsResource.addResource("{product_id}");
    productByIdResource.addMethod("GET", getProductByIdLambdaIntegration);
  }
}
