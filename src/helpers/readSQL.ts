import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUERIES_DIR = path.resolve(__dirname, "../queries");

const readSQL = (filename: string): string => {
  const filePath = path.join(QUERIES_DIR, `${filename}.sql`);
  const result = fs.readFileSync(filePath, "utf-8");
  return result;
};

export default readSQL;
