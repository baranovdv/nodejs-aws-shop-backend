import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class NodejsAwsShopBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsList = new lambda.Function(this, "getProductsList", {
      runtime: lambda.Runtime.NODEJS_20_X, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset("lambda"), // Points to the lambda directory
      handler: "getProductsList.handler", // Points to the 'hello' file in the lambda directory
    });

    const getProductsById = new lambda.Function(this, "getProductsById", {
      runtime: lambda.Runtime.NODEJS_20_X, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset("lambda"), // Points to the lambda directory
      handler: "getProductsById.handler", // Points to the 'hello' file in the lambda directory
    });

    const api = new apigateway.LambdaRestApi(this, "getProducts", {
      handler: getProductsList,
      proxy: false,
    });

    // new cdk.CfnOutput(this, 'HelloWorldFunctionName', {
    //   value: getProductsList.functionName,
    //   description: 'JavaScript Lambda function'
    // });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET");

    const productByIdResource = productsResource.addResource("{id}");
    productByIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsById)
    );
  }
}
