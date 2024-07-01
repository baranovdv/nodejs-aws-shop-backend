import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { handler } from "../lambda/importProductsFile";
import { APIGatewayProxyEvent } from "aws-lambda";

const mockFileName = "test-file.csv";
const mockSignedUrl = 'https://test-bucket.s3.ap-southeast-2.amazonaws.com/test-file.csv';

jest.mock("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: jest.fn().mockReturnValue(Promise.resolve(mockSignedUrl)),
  };
});

describe("importProductsFile handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a 500 Error if getting signedURL fails", async () => {
    const event = {
      queryStringParameters: { name: mockFileName },
    } as unknown as APIGatewayProxyEvent;

    const res = await handler(event);
    expect(res.body).toEqual({ message: "Signed url failed" }); 
    expect(res.statusCode).toBe(500);
  });

  it("should return a signed url", async () => {
    const event = {
      queryStringParameters: { name: mockFileName },
    } as unknown as APIGatewayProxyEvent;

    const res = await handler(event);
    expect(res.body).toEqual({ url: mockSignedUrl });
    expect(res.statusCode).toBe(200);
  });

  it("should return a 400 Error if name is not provided", async () => {
    const event = {} as unknown as APIGatewayProxyEvent;

    const res = await handler(event);
    expect(res.body).toEqual({ message: "File name is needed" });
    expect(res.statusCode).toBe(400);
  });
});