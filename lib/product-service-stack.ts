import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
