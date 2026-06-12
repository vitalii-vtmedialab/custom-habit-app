import { createHash } from "crypto";

export function authToken(pin: string): string {
  return createHash("sha256").update(`habit-app:${pin}`).digest("hex");
}
