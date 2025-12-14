import type { Buffer } from "buffer";

export const extractText = async (
  file: { buffer: Buffer }
): Promise<string> => {
  console.log("[PDF] extractText called");
  console.log("[PDF] Buffer size (bytes):", file.buffer.length);
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    
    const uint8Array = new Uint8Array(file.buffer);
    
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    
    console.log("[PDF] Extracted text length:", fullText.length);
    return fullText;
  } catch (err) {
    console.error("[PDF] Extraction FAILED:", err);
    throw err;
  }
};