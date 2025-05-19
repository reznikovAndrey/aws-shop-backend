import { S3Event } from "aws-lambda";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { Readable } from "node:stream";
import { getS3Client } from "../../utils";

const client = getS3Client();

export async function importFileParser(event: S3Event) {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " "),
    );

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const res = await client.send(command);

    const stream = res.Body as Readable;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          console.log("Row:", row);
        })
        .on("end", () => {
          console.log("CSV parsing complete.");
          resolve();
        })
        .on("error", (err) => {
          console.error("Error while parsing CSV:", err);
          reject(err);
        });
    });
  } catch (err) {
    console.error(err);
  }
}
