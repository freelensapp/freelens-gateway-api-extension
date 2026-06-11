import crypto from "crypto";

export function createHash(data: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").substring(0, 16);
}
