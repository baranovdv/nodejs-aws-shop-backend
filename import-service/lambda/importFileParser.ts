import { APIGatewayProxyEvent } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.REGION || "ap-southeast-2";

export const handler = async (event: any) => {
  const bucket = event['Records'][0]['s3']['bucket']['name'];
  const uploadedKey = decodeURIComponent(event['Records'][0]['s3']['object']['key'].replace(/\+/g, ' '));

  console.log(`Copying from s3://${bucket}/${uploadedKey}`);

  const parsedKey = uploadedKey.replace('uploaded/', 'parsed/');


  
};
