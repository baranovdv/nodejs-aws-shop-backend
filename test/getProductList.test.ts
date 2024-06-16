import { APIGatewayProxyResult } from 'aws-lambda';
import { productsMocks } from '../lambda/mocks';
import { handler } from '../lambda/getProductsList';

describe('Test for getProducts handler', () => {
  it('should return correct products mock data', async () => {
    const expectedResponse: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productsMocks)
    };

    const actualResponse = await handler();

    expect(actualResponse).toEqual(expectedResponse);
  });
});