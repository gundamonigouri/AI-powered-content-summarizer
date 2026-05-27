import pdfParse from 'pdf-parse';
import { AppError } from '../utils/apiResponse.js';
import { cleanText } from '../utils/textCleaner.js';

export const extractPdfText = async (buffer, originalName = 'document.pdf') => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('Empty PDF file', 400);
  }

  try {
    const data = await pdfParse(buffer);
    const text = cleanText(data.text);

    if (!text || text.length < 20) {
      throw new AppError('PDF contains no extractable text. It may be scanned/image-only.', 400);
    }

    return {
      title: originalName.replace(/\.pdf$/i, ''),
      content: text,
      pages: data.numpages,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to parse PDF. Ensure the file is a valid PDF.', 400);
  }
};
