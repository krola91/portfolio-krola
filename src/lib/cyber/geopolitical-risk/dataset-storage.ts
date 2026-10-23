import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

/** Publish three validated files as one edition. Any failed switch restores the old directory. */
export async function publishGeoEdition(target: string, files: Record<string, unknown>) {
  const directory = resolve(target);
  if (basename(directory) !== "generated") throw new Error("Expected a module-local generated directory");
  const suffix = `${process.pid}-${Date.now()}`; const staging = `${directory}.stage-${suffix}`; const backup = `${directory}.backup-${suffix}`;
  await mkdir(dirname(directory), { recursive: true }); let movedPrevious = false; let published = false;
  try {
    const serialized = Object.entries(files).map(([name, value]) => { if (!/^[a-z.]+\.json$/.test(name)) throw new Error("Invalid snapshot filename"); return [name, `${JSON.stringify(value, null, 2)}\n`] as const; });
    await mkdir(staging);
    for (const [name, value] of serialized) await writeFile(resolve(staging, name), value, "utf8");
    try { await rename(directory, backup); movedPrevious = true; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    try { await rename(staging, directory); published = true; } catch (error) { if (movedPrevious) { await rename(backup, directory); movedPrevious = false; } throw error; }
  } finally {
    await rm(staging, { recursive: true, force: true });
    if (published && movedPrevious) await rm(backup, { recursive: true, force: true });
  }
}
