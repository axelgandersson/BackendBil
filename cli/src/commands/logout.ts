import * as p from "@clack/prompts";
import { clearToken } from "../auth.js";

export async function logoutCommand(): Promise<void> {
  await clearToken();
  p.log.info("Du har loggats ut.");
}
