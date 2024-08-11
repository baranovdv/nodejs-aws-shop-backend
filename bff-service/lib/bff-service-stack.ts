import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";

export class BffServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const httpApi = new apigatewayv2.HttpApi(this, "BFFModuleAPIv2", {
      createDefaultStage: true,
    });

    // Define the HTTP URL integration
    const httpIntegration =
      new cdk.aws_apigatewayv2_integrations.HttpUrlIntegration(
        "BFFModuleAPIv2Config",
        decodeURI(
          new URL(
            "/{proxy}",
            "http://baranovdv-bff-dev.ap-southeast-2.elasticbeanstalk.com/"
          ).href
        ),
        {
          method: apigatewayv2.HttpMethod.ANY,
        }
      );

    // Add a catch-all route for forwarding requests
    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: httpIntegration,
    });
  }
}
