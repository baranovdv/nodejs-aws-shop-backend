import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda } from "aws-cdk-lib";
import { config } from "dotenv";

config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const login = (process.env.LOGIN as string) || "baranovdv";
    const password = (process.env.PASSWORD as string) || "TEST_PASSWORD";

    const basicAuthorizerFunction = new aws_lambda.Function(
      this,
      "basicAuthorizer",
      {
        runtime: aws_lambda.Runtime.NODEJS_16_X,
        code: aws_lambda.Code.fromAsset("lambda"),
        handler: "basicAuthorizer.handler",
        environment: {
          LOGIN: login,
          PASSWORD: password,
        },
      }
    );

    new cdk.CfnOutput(this, "basicAuthorizerFunction", {
      value: basicAuthorizerFunction.functionArn,
      exportName: "basicAuthorizerFunctionArn",
    });
  }
}
