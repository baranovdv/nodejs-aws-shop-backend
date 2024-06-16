import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { productsMocks } from '../lambda/mocks';
import { handler } from '../lambda/getProductsById';

describe('getProductById handler tests', () => {
  it('should return a product with a matching id', async () => {
    const id = productsMocks[0].id;
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id
      }
    } as any;

    const response = await handler(event);
    
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(productsMocks[0]);
  });

  it('should return a 404 for a non-existent product id', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'not-existing-id'
      }
    } as any;

    const response = await handler(event);

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.body)).toEqual({ message: "Product not found" });
  });
});