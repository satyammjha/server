import { PDFParse } from "pdf-parse";
import { readFile } from "node:fs/promises";

export const extractText = async (
  file: { path: string; buffer: Buffer }
): Promise<string> => {
  const parser = new PDFParse({ data: file.buffer });
  const textResult = await parser.getText();
  await parser.destroy();

  return textResult?.text || "";
};