import { SQSEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { randomUUID } from "node:crypto";
import { AvailableProduct } from "../types/types";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";

export const handler = async (event: SQSEvent) => {
  const dynamoDB = new DynamoDB.DocumentClient({ region: region });

  const messages = event.Records;
  console.log('messages', messages);

  for (const message of messages) {
    const productsArray = JSON.parse(message.body) as AvailableProduct[];

    for (const product of productsArray) {
      const { title, description, price, count } = product;

      const newId = randomUUID();

      try {
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
      } catch (err) {
        console.log("Error create product", err);
      }
    }
  }
};
