import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headersCORS } from "./data";
import { DynamoDB } from "aws-sdk";
import { AvailableProduct, Product, Stock } from "../types/types";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamoDB = new DynamoDB.DocumentClient({ region: region });
  const id = event.pathParameters?.id;

  console.log(`GET product with id ${id}`)

  try {
    const product = await dynamoDB
      .get({
        TableName: productsTableName,
        Key: { id: id },
      })
      .promise();

    const productDB = product.Item as Product;

    if (!productDB) {
      return {
        statusCode: 404,
        headers: headersCORS,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const stock = await dynamoDB
      .get({
        TableName: stockTableName,
        Key: { product_id: id },
      })
      .promise();
    const stockDB = stock.Item as Stock;

    const availableProduct: AvailableProduct = {
      ...productDB,
      count: stockDB.count,
    };

    console.log("availableProduct", availableProduct);

    return {
      statusCode: 200,
      headers: headersCORS,
      body: JSON.stringify(availableProduct),
    };
  } catch (err) {
    console.log("Error getProduct", err);

    return {
      statusCode: 500,
      headers: headersCORS,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
