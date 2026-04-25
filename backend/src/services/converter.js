const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function pdfToDocx(inputPath, outputDir) {
  const dataBuffer = fs.readFileSync(inputPath);
  const parser = new PDFParse({ data: dataBuffer });
  const parsed = await parser.getText();
  await parser.destroy();
  const text = parsed.text || '';

  const paragraphs = text
    .split(/\r?\n/)
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
  }

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const buffer = await Packer.toBuffer(doc);

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.docx`);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

async function docxToPdf(inputPath, outputDir) {
  const { value: text } = await mammoth.extractRawText({ path: inputPath });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 11;
  const lineHeight = fontSize * 1.4;
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;

  const sanitize = (s) => s.replace(/[^\x20-\x7E]/g, ' ');

  const wrapLine = (line) => {
    const safe = sanitize(line);
    if (!safe) return [''];
    const words = safe.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);
      if (width > usableWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const rawLines = (text || '').split(/\r?\n/);
  const wrapped = rawLines.flatMap(wrapLine);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of wrapped) {
    if (y < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.pdf`);
  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}

async function convertFile(inputPath, format, outputDir) {
  if (format === 'docx') return pdfToDocx(inputPath, outputDir);
  if (format === 'pdf') return docxToPdf(inputPath, outputDir);
  throw new Error(`Unsupported output format: ${format}`);
}

module.exports = { convertFile, pdfToDocx, docxToPdf };
