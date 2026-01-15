import type { Buffer } from "buffer";
const pdf = require("pdf-parse");

export const extractText = async (
  file: { buffer: Buffer }
): Promise<string> => {
  console.log("[PDF] extractText called");
  console.log("[PDF] Buffer size (bytes):", file.buffer.length);

  try {
    const data = await pdf(file.buffer);
    const text = data.text || "";

    console.log("[PDF] Extracted text length:", text.length);
    return text;
  } catch (err) {
    console.error("[PDF] Extraction FAILED:", err);
    throw err;
  }
};