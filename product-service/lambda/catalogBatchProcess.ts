import { SQSEvent } from "aws-lambda";

export const handler = (event: SQSEvent) => {
  const message = event.Records[0].body;

  console.log(message);
};
