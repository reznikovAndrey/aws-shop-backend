import { Readable } from "node:stream";
import csvParser from "csv-parser";

export async function parseFile(stream: Readable) {
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
}
