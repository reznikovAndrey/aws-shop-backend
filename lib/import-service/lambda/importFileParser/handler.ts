import { S3Event } from "aws-lambda";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { getS3Client } from "../../utils";
import { parseFile } from "./utils";
import { FILES_PARSED_DIR_NAME } from "./constant";

const client = getS3Client();

export async function importFileParser(event: S3Event) {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const uploadedKey = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " "),
    );

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: uploadedKey,
    });

    const res = await client.send(getCommand);

    const stream = res.Body as Readable;

    await parseFile(stream);

    const targetKey = [
      FILES_PARSED_DIR_NAME,
      uploadedKey.split("/").at(-1),
    ].join("/");
    const copyCommand = new CopyObjectCommand({
      Bucket: bucket,
      CopySource: [bucket, uploadedKey].join("/"),
      Key: targetKey,
    });

    await client.send(copyCommand);
    console.log(`File ${uploadedKey} was successfully copied to ${targetKey}`);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: uploadedKey,
    });
    await client.send(deleteCommand);
    console.log(`File ${uploadedKey} was successfully deleted`);
  } catch (err) {
    console.error(err);
  }
}
