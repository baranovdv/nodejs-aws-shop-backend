import { Construct } from "constructs";
import { Stack, type StackProps, aws_s3, aws_lambda, aws_apigateway, aws_lambda_event_sources} from "aws-cdk-lib";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = aws_s3.Bucket.fromBucketName(
      this,
      "S3Bucket",
      "aws-shop-s3-bucket"
    );

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
      }
    );

    bucket.grantReadWrite(importProductsFileFunction);
    bucket.grantReadWrite(importFileParserFunction);
    bucket.grantDelete(importFileParserFunction);
    bucket.grantPut(importFileParserFunction);

    const api = new aws_apigateway.RestApi(this, "importApi");
    const importResource = api.root.addResource("import");

    const importIntegration = new aws_apigateway.LambdaIntegration(
      importProductsFileFunction
    );
    importResource.addMethod("GET", importIntegration);

    const s3ObjCreatedEvent = new aws_lambda_event_sources.S3EventSourceV2(bucket, {
      events: [aws_s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: "uploaded/" }],
    });

    importFileParserFunction.addEventSource(s3ObjCreatedEvent);
  }
}
