import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = s3.Bucket.fromBucketName(
      this,
      "S3Bucket",
      "aws-shop-s3-bucket"
    );

    const importProductsFileFunction = new lambda.Function(
      this,
      "importProductsFile",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "importProductsFile.handler",
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      }
    );

    bucket.grantReadWrite(importProductsFileFunction);

    const api = new apigateway.RestApi(this, "importApi");
    const importResource = api.root.addResource("import");

    const importIntegration = new apigateway.LambdaIntegration(
      importProductsFileFunction
    );
    importResource.addMethod("GET", importIntegration);
  }
}
