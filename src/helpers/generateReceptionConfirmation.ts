import crypto from "crypto";

export default function generateUniqueHash(): string {
  const hash = crypto.randomBytes(32).toString("base64url");
  return hash.slice(0, 8);
}
