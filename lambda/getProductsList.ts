import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { headersCORS } from "./data";
import { AvailableProduct, Product, Stock } from "../types/types";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const dynamoDB = new DynamoDB.DocumentClient({ region: region });

  try {
    const products = await dynamoDB
      .scan({ TableName: productsTableName })
      .promise();
    const productsDB = products.Items as Product[];

    const stock = await dynamoDB.scan({ TableName: stockTableName }).promise();
    const stockDB = stock.Items as Stock[];

    const availableProducts: AvailableProduct[] = productsDB.map((product) => {
      const count =
        stockDB.find((stock) => stock.product_id === product.id)?.count || 0;

      return { ...product, count };
    });

    console.log("availableProducts", availableProducts);

    return {
      statusCode: 200,
      headers: headersCORS,
      body: JSON.stringify(availableProducts),
    };
  } catch (err) {
    console.log("Error getProducts", err);

    return {
      statusCode: 500,
      headers: headersCORS,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
