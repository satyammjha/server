import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export async function extractText(file) {
    const { path: filePath, mimetype, originalname, buffer } = file;
    
    if (buffer) {
        return extractTextFromBuffer(buffer, mimetype, originalname);
    }
    
    if (filePath && fs.existsSync(filePath)) {
        return extractTextFromFile(filePath, mimetype, originalname);
    }
    
    throw new Error('File not found or no buffer available');
}

export async function extractTextFromBuffer(buffer, mimetype, originalname) {
    if (mimetype === 'application/pdf') {
        try {
          
            const parser = new PDFParse({ data: buffer });
            const textResult = await parser.getText();
            return textResult.text || '';
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error(`Failed to parse PDF file: ${error.message}`);
        }
    } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword' ||
        originalname.toLowerCase().endsWith('.docx') ||
        originalname.toLowerCase().endsWith('.doc')
    ) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } catch (error) {
            console.error('Error parsing Word document:', error);
            throw new Error(`Failed to parse Word document: ${error.message}`);
        }
    } else if (
        mimetype === 'text/plain' ||
        originalname.toLowerCase().endsWith('.txt')
    ) {
        return buffer.toString('utf8');
    }
    
    throw new Error(`Unsupported file type: ${mimetype}`);
}

export async function extractTextFromFile(filePath, mimetype, originalname) {
    const buffer = fs.readFileSync(filePath);
    return extractTextFromBuffer(buffer, mimetype, originalname);
}


export async function extractTextFromPDF(buffer) {
    try {
        const parser = new PDFParse({ 
            data: buffer,
           
            pagerender: render_page,
            max: 0
        });
        
        const result = await parser.getText();
        return result.text || '';
    } catch (error) {
        console.error('PDF extraction failed:', error);
        throw new Error(`PDF parsing error: ${error.message}`);
    }
}

async function render_page(pageData) {
    if (pageData.getTextContent) {
        const textContent = await pageData.getTextContent();
        return textContent.items.map(item => item.str).join(' ');
    }
    return '';
}