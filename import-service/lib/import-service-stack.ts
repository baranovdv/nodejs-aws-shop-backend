import { Construct } from "constructs";
import {
  Stack,
  type StackProps,
  aws_s3,
  aws_lambda,
  aws_apigateway,
  aws_lambda_event_sources,
  aws_iam,
  CfnOutput,
  Fn,
} from "aws-cdk-lib";
import { IdentitySource } from "aws-cdk-lib/aws-apigateway";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = aws_s3.Bucket.fromBucketName(
      this,
      "S3Bucket",
      "aws-shop-s3-bucket"
    );

    const sqsServiceUrl = Fn.importValue("sqsServiceUrl");
    // const sqsServiceUrl = 'placeholder';

    const importProductsFileFunction = new aws_lambda.Function(
      this,
      "importProductsFile",
      {
        runtime: aws_lambda.Runtime.NODEJS_16_X,
        code: aws_lambda.Code.fromAsset("lambda"),
        handler: "importProductsFile.handler",
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      }
    );

    const importFileParserFunction = new aws_lambda.Function(
      this,
      "importFileParser",
      {
        runtime: aws_lambda.Runtime.NODEJS_16_X,
        code: aws_lambda.Code.fromAsset("lambda"),
        handler: "importFileParser.handler",
        environment: {
          SQS_SERVICE_URL: sqsServiceUrl,
        },
      }
    );

    const basicAuthorizerFunctionArn = Fn.importValue(
      "basicAuthorizerFunctionArn"
    );

    const basicAuthorizerFunction = aws_lambda.Function.fromFunctionAttributes(
      this,
      "basicAuthorizerFunction",
      {
        functionArn: basicAuthorizerFunctionArn,
      }
    );

    new CfnOutput(this, "importFileParserFunction", {
      value: importFileParserFunction.functionArn,
      exportName: "importFileParserFunctionArn",
    });

    new CfnOutput(this, "importFileParserFunctionRole", {
      value: importFileParserFunction.role!.roleArn,
      exportName: "importFileParserFunctionRoleArn",
    });

    bucket.grantReadWrite(importProductsFileFunction);
    bucket.grantReadWrite(importFileParserFunction);
    bucket.grantDelete(importFileParserFunction);
    bucket.grantPut(importFileParserFunction);

    const api = new aws_apigateway.RestApi(this, "importApi");

    api.addGatewayResponse("UNAUTHORIZED_RESPONSE", {
      type: aws_apigateway.ResponseType.UNAUTHORIZED,
      statusCode: "401",
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
      templates: {
        "application/json": '{ "message": "Unauthorized request." }',
      },
    });

    api.addGatewayResponse("ACCESS_DENIED_RESPONSE", {
      type: aws_apigateway.ResponseType.ACCESS_DENIED,
      statusCode: "403",
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
      templates: {
        "application/json": '{ "message": "Access denied." }',
      },
    });

    const importResource = api.root.addResource("import");

    const importIntegration = new aws_apigateway.LambdaIntegration(
      importProductsFileFunction
    );

    const role = new Role(this, "authRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    const auth = new aws_apigateway.TokenAuthorizer(this, "basicAuthorizer", {
      handler: basicAuthorizerFunction,
      identitySource: IdentitySource.header("Authorization"),
      assumeRole: role,
    });

    importResource.addMethod("GET", importIntegration, {
      authorizer: auth,
    });

    const s3ObjCreatedEvent = new aws_lambda_event_sources.S3EventSourceV2(
      bucket,
      {
        events: [aws_s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "uploaded/" }],
      }
    );

    importFileParserFunction.addEventSource(s3ObjCreatedEvent);
  }
}
