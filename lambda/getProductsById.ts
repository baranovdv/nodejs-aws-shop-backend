import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { productsMocks } from "./mocks";
import { headersCORS } from "./data";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (id) {
    const product = productsMocks.find((product) => product.id == id);

    if (product) {
      return {
        statusCode: 200,
        headers: headersCORS,
        body: JSON.stringify(product),
      };
    }
  }

  return {
    statusCode: 404,
    headers: headersCORS,
    body: JSON.stringify({ message: "Product not found" }),
  };
};
