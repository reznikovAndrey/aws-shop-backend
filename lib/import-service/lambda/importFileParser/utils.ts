import { Readable } from "node:stream";
import csvParser from "csv-parser";
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

const sqs = new SQSClient({});

// TODO: rewrite with SendMessageBatchCommand
export async function parseFileAndSendMessageToSQS(stream: Readable) {
  const queueUrl = process.env.QUEUE_URL;

  const rows: {}[] = [];

  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on("data", (row: {}) => {
        rows.push(row);
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

  const commandsInput: SendMessageCommandInput[] = [];

  rows.forEach((row, i) => {
    commandsInput.push({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(row),
    });
  });

  const results = await Promise.allSettled(
    commandsInput.map(async (commandInput) =>
      sqs.send(new SendMessageCommand(commandInput)),
    ),
  );

  results.forEach((result) => {
    switch (result.status) {
      case "rejected":
        console.error("Failed to send message: ", result.reason);
        break;
      case "fulfilled":
        console.info("Message send: ", result.value);
    }
  });
}
