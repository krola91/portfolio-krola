import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeJsonAtomically(targetPath: string, value: unknown): Promise<void> {
	await mkdir(dirname(targetPath), { recursive: true });
	const temporaryPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
	try {
		await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
		await rename(temporaryPath, targetPath);
	} catch (error) {
		await unlink(temporaryPath).catch(() => undefined);
		throw error;
	}
}
