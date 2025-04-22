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

    const getProductListLambda = new lambda.Function(this, "get-product-list", {
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.getProductList",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    });

    const getProductListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductListLambda,
      {},
    );

    const productsResource = api.root.addResource("products");

    productsResource.addMethod("GET", getProductListLambdaIntegration);
  }
}
