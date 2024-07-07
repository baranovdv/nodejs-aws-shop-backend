import { SQSEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { randomUUID } from "node:crypto";
import { AvailableProduct } from "../types/types";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";
const snsTopicArn = process.env.SNS_TOPIC_ARN;

const snsClient = new SNSClient({ region: region });
const dynamoDB = new DynamoDB.DocumentClient({ region: region });

export const handler = async (event: SQSEvent) => {
  const messages = event.Records;

  for (const message of messages) {
    const productsArray = JSON.parse(message.body) as AvailableProduct[];

    for (const product of productsArray) {
      const { title, description, price, count } = product;

      const newId = randomUUID();

      const productItem = {
        id: newId,
        title,
        description,
        price,
      };

      const stockItem = {
        product_id: newId,
        count,
      }

      try {
        await dynamoDB
          .transactWrite({
            TransactItems: [
              {
                Put: {
                  TableName: productsTableName,
                  Item: productItem,
                },
              },
              {
                Put: {
                  TableName: stockTableName,
                  Item: stockItem,
                },
              },
            ],
          })
          .promise();

        const snsMessage = {
          Subject: "New product was uploaded",
          Message: JSON.stringify(`New product was created ${productItem.title} in stock: ${stockItem.count}`),
          TopicArn: snsTopicArn,
          MessageAttributes: {
            price: {
              DataType: "Number",
              StringValue: `${price}`,
            },
          },
        };

        await snsClient.send(new PublishCommand(snsMessage));

        console.log("created");
      } catch (err) {
        console.log("Error create product", err);
      }
    }
  }
};
