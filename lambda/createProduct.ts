import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headersCORS } from "./data";
import { DynamoDB } from "aws-sdk";
import { AvailableProduct, Product, Stock } from "../types/types";
import { v4 } from "uuid";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamoDB = new DynamoDB.DocumentClient({ region: region });

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: headersCORS,
        body: JSON.stringify({ message: "No data provided" }),
      };
    }

    console.log(`POST product with body ${event.body}`)

    const { title, description, price, count } = JSON.parse(
      event.body
    ) as AvailableProduct;

    if (!title) {
      return {
        statusCode: 400,
        headers: headersCORS,
        body: JSON.stringify({ message: "No title provided" }),
      };
    }

    if (!description) {
      return {
        statusCode: 400,
        headers: headersCORS,
        body: JSON.stringify({ message: "No description provided" }),
      };
    }

    if (!price) {
      return {
        statusCode: 400,
        headers: headersCORS,
        body: JSON.stringify({ message: "No price provided" }),
      };
    }

    if (!count) {
      return {
        statusCode: 400,
        headers: headersCORS,
        body: JSON.stringify({ message: "No count provided" }),
      };
    }

    const newId = v4();

    await dynamoDB
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: productsTableName,
              Item: {
                id: newId,
                title,
                description,
                price,
              },
            },
          },
          {
            Put: {
              TableName: stockTableName,
              Item: {
                product_id: newId,
                count,
              },
            },
          },
        ],
      })
      .promise();

    console.log("created");

    return {
      statusCode: 201,
      headers: headersCORS,
      body: JSON.stringify({ message: "Product is created" }),
    };
  } catch (err) {
    console.log("Error create product", err);

    return {
      statusCode: 500,
      headers: headersCORS,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
