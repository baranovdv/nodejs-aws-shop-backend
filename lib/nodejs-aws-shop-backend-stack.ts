import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";

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

    productsTable.grantReadWriteData(getProductsList);
    stockTable.grantReadWriteData(getProductsList);
    productsTable.grantReadWriteData(getProductsById);
    stockTable.grantReadWriteData(getProductsById);
    productsTable.grantReadWriteData(createProducts);
    stockTable.grantReadWriteData(createProducts);

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
  }
}
