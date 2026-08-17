import { describe, it, expect, beforeEach, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Set env var BEFORE importing auth so getConfigDir() picks it up
const tempDir = mkdtempSync(join(tmpdir(), "bil-cli-test-"));
vi.stubEnv("BIL_CLI_CONFIG_DIR", tempDir);

const { getToken, saveToken, clearToken } = await import("./auth.js");

describe("auth token storage", () => {
  beforeEach(async () => {
    await clearToken();
  });

  it("returns null when no token is saved", async () => {
    expect(await getToken()).toBeNull();
  });

  it("saves and retrieves a token", async () => {
    await saveToken("test-token-123");
    expect(await getToken()).toBe("test-token-123");
  });

  it("returns null after clearing", async () => {
    await saveToken("test-token-123");
    await clearToken();
    expect(await getToken()).toBeNull();
  });
});
