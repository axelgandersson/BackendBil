import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

function getConfigDir(): string {
  return process.env.BIL_CLI_CONFIG_DIR ?? join(homedir(), ".config", "bil-cli");
}

function getTokenFile(): string {
  return join(getConfigDir(), "auth.json");
}

export async function getToken(): Promise<string | null> {
  try {
    const content = await readFile(getTokenFile(), "utf-8");
    const { token } = JSON.parse(content) as { token: string | null };
    return token ?? null;
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(getTokenFile(), JSON.stringify({ token }), "utf-8");
}

export async function clearToken(): Promise<void> {
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(getTokenFile(), JSON.stringify({ token: null }), "utf-8");
}
