import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FILES_UPLOAD_DIR_NAME, SIGNED_URL_VALID_TIME_RANGE } from "./constant";
import { getS3Client } from "../shared/utils";
import { BadRequestError, ServerError } from "../../../shared/error";

const client = getS3Client();

export async function importProductsFile({ fileName }: { fileName?: string }) {
  if (!fileName) {
    throw new BadRequestError("Missing filename");
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
    throw new ServerError();
  }
}
