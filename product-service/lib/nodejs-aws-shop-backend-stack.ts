import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";
import * as SQS from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as aws_lambda_event_sources from "aws-cdk-lib/aws-lambda-event-sources";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";

const environmentConsts = {
  PRODUCTS: "Products",
  STOCK: "Stock",
};
export class NodejsAwsShopBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamoDB.Table(this, "ProductsTable", {
      tableName: productsTableName,
      partitionKey: { name: "id", type: dynamoDB.AttributeType.STRING },
      readCapacity: 1,
      writeCapacity: 1,
    });

    const stockTable = new dynamoDB.Table(this, "StockTable", {
      tableName: stockTableName,
      partitionKey: { name: "product_id", type: dynamoDB.AttributeType.STRING },
      readCapacity: 1,
      writeCapacity: 1,
    });

    const sqsService = new SQS.Queue(this, "catalogItemsQueue");
    new cdk.CfnOutput(this, "sqsServiceUrl", {
      value: sqsService.queueUrl,
      exportName: "sqsServiceUrl",
    });

    const getProductsList = new lambda.Function(this, "getProductsList", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "getProductsList.handler",
      environment: environmentConsts,
    });

    const getProductsById = new lambda.Function(this, "getProductsById", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "getProductsById.handler",
      environment: environmentConsts,
    });

    const createProducts = new lambda.Function(this, "createProduct", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "createProduct.handler",
      environment: environmentConsts,
    });

    const catalogBatchProcess = new lambda.Function(
      this,
      "catalogBatchProcess",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "catalogBatchProcess.handler",
        environment: environmentConsts,
      }
    );

    const importFileParserFunctionArn = cdk.Fn.importValue(
      "importFileParserFunctionArn"
    );
    const importFileParserFunctionRoleArn = cdk.Fn.importValue(
      "importFileParserFunctionRoleArn"
    );

    const importFileParserFunctionRole = iam.Role.fromRoleArn(
      this,
      "importFileParserFunctionRole",
      importFileParserFunctionRoleArn
    );
    const importFileParserFunction = lambda.Function.fromFunctionAttributes(
      this,
      "importFileParserFunction",
      {
        functionArn: importFileParserFunctionArn,
        role: importFileParserFunctionRole,
      }
    );

    productsTable.grantReadWriteData(getProductsList);
    stockTable.grantReadWriteData(getProductsList);
    productsTable.grantReadWriteData(getProductsById);
    stockTable.grantReadWriteData(getProductsById);
    productsTable.grantReadWriteData(createProducts);
    stockTable.grantReadWriteData(getProductsById);
    productsTable.grantReadWriteData(catalogBatchProcess);
    stockTable.grantReadWriteData(catalogBatchProcess);
    sqsService.grantConsumeMessages(catalogBatchProcess);
    sqsService.grantSendMessages(importFileParserFunction);

    const api = new apigateway.LambdaRestApi(this, "getProducts", {
      handler: getProductsList,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    const productsResource = api.root.addResource("products");
    const getIntegration = new apigateway.LambdaIntegration(getProductsList);
    const postIntegration = new apigateway.LambdaIntegration(createProducts);
    productsResource.addMethod("GET", getIntegration);
    productsResource.addMethod("POST", postIntegration);

    const productByIdResource = productsResource.addResource("{id}");
    productByIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsById)
    );

    catalogBatchProcess.addEventSource(
      new aws_lambda_event_sources.SqsEventSource(sqsService, {
        batchSize: 5,
        maxBatchingWindow: cdk.Duration.seconds(3),
      })
    );
  }
}
