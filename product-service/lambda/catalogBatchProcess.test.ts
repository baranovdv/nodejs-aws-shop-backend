import { SNSClient } from "@aws-sdk/client-sns";
import { handler } from "./catalogBatchProcess";
import { SQSEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn().mockReturnValue({
      send: jest.fn(),
    }),
    DynamoDB: jest.fn().mockReturnValue({
      DocumentClient: jest.fn(),
    }),


    PublishCommand: jest.fn(),
  };
});

describe("handler", () => {
  let snsClientMock: any;
  let dbClient: any;

  beforeEach(() => {
    snsClientMock = new SNSClient();
    dbClient = new DynamoDB.DocumentClient();

    jest.clearAllMocks();
  });

  it("Should process items and send SNS calls", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify([
            {
              id: "0",
              title: "Product 1",
              description: "Description 1",
              price: 1,
              count: 2,
            },
            {
              id: "1",
              title: "Product 2",
              description: "Description 2",
              price: 10,
              count: 20,
            },
          ]),
        },
      ],
    };

    await handler(event as SQSEvent);

    expect(snsClientMock.send).toHaveBeenCalledTimes(2);
  });
});
