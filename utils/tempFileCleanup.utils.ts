import fs from "fs/promises";
import path from "path";
import os from "os";

export async function cleanupOldTempFiles(maxAgeMinutes: number = 60) {
    try {
        const tempDir = path.join(os.tmpdir(), 'resume-uploads');
        const files = await fs.readdir(tempDir);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = await fs.stat(filePath);
            const ageMinutes = (now - stats.mtimeMs) / 1000 / 60;

            if (ageMinutes > maxAgeMinutes) {
                await fs.unlink(filePath);
                console.log(`Deleted old temp file: ${file}`);
            }
        }
    } catch (err) {
        console.error('Error cleaning up temp files:', err);
    }
}

export function startTempFileCleanup() {
    setInterval(() => {
        cleanupOldTempFiles(60);
    }, 60 * 60 * 1000);
}