import { APIGatewayProxyEvent } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.REGION || "ap-southeast-2";

export const handler = async (event: APIGatewayProxyEvent) => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      body: { message: "File name is needed" },
    };
  }

  const bucketName = process.env.BUCKET_NAME || "";
  const key = `uploaded/${fileName}`;

  const client = new S3Client({ region: region });
  const command = new PutObjectCommand({ Bucket: bucketName, Key: key });

  try {
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      body: JSON.stringify(signedUrl),
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  } catch {
    return {
      statusCode: 500,
      body: { message: "Signed url failed" },
    };
  }
};
