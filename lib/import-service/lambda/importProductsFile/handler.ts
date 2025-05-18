import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  FILES_UPLOAD_DIR_NAME,
  MISSING_FILENAME_ERROR,
  SIGNED_URL_VALID_TIME_RANGE,
} from "./constant";
import { SERVER_ERROR } from "../shared/constant";
import { getS3Client } from "../shared/utils";

const client = getS3Client();

// TODO: configure rest api for error responses
export async function importProductsFile({ fileName }: { fileName?: string }) {
  if (!fileName) {
    throw new Error(MISSING_FILENAME_ERROR);
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: [FILES_UPLOAD_DIR_NAME, fileName].join("/"),
    });

    return getSignedUrl(client, command, {
      expiresIn: SIGNED_URL_VALID_TIME_RANGE,
    });
  } catch (err) {
    console.error(err);
    throw new Error(SERVER_ERROR);
  }
}
