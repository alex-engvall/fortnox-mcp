import { type FileHandle, open } from "node:fs/promises";
import { resolve } from "node:path";
import { DocsCatalog, DocsError, MAX_SPEC_BYTES } from "@fortnox-mcp/docs";

// File selection is an operator setting, never an MCP argument.
export async function loadDocsCatalog(
  configuredPath?: string,
): Promise<DocsCatalog> {
  if (configuredPath !== undefined && !configuredPath.trim())
    throw new DocsError("INVALID_SPEC");
  const path = resolve(configuredPath ?? "vendor-specs/fortnox/openapi.json");
  let file: FileHandle;
  try {
    file = await open(path, "r");
  } catch (error) {
    if (
      configuredPath === undefined &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    )
      return DocsCatalog.create();
    throw new DocsError("SPEC_UNAVAILABLE");
  }
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > MAX_SPEC_BYTES)
      throw new DocsError("INVALID_SPEC");
    const bytes = Buffer.alloc(MAX_SPEC_BYTES + 1);
    let length = 0;
    while (length < bytes.length) {
      const chunk = await file.read(
        bytes,
        length,
        bytes.length - length,
        length,
      );
      if (chunk.bytesRead === 0) break;
      length += chunk.bytesRead;
    }
    if (length > MAX_SPEC_BYTES) throw new DocsError("INVALID_SPEC");
    const raw = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(0, length),
    );
    return await DocsCatalog.create({ raw });
  } catch (error) {
    if (error instanceof DocsError) throw error;
    throw new DocsError("INVALID_SPEC");
  } finally {
    await file.close();
  }
}
