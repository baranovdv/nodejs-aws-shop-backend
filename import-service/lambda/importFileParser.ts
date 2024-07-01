import { S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import * as csv from "csv-parser";
import { Readable } from "stream";

const region = process.env.REGION || "ap-southeast-2";
const client = new S3Client();

export const handler = async (event: S3Event) => {
  console.log("Event from s3 bucket", JSON.stringify(event));

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    const dataFromS3 = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const resultData: Record<string, string>[] = [];

    (dataFromS3.Body as Readable)
      .pipe(csv())
      .on("data", (data) => resultData.push(data))
      .on("end", () => {
        console.log("Resulted data", resultData);
      });

    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: key.replace("uploaded/", "parsed/"),
      })
    );

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}.`;
    console.log(message);
    throw new Error(message);
  }
};
