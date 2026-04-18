const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

function getLibreOfficePath() {
  // Check environment variable first
  if (process.env.LIBREOFFICE_PATH && fs.existsSync(process.env.LIBREOFFICE_PATH)) {
    return process.env.LIBREOFFICE_PATH;
  }
  // Mac default
  const mac = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
  if (fs.existsSync(mac)) return mac;
  // Linux
  const linux = '/usr/bin/libreoffice';
  if (fs.existsSync(linux)) return linux;
  // Try soffice on PATH
  return 'soffice';
}

/**
 * Convert a file using LibreOffice
 * @param {string} inputPath  - absolute path to input file
 * @param {string} format     - output format, e.g. 'pdf' or 'docx'
 * @param {string} outputDir  - directory to write output
 * @returns {Promise<string>} - absolute path to converted file
 */
function convertWithLibreOffice(inputPath, format, outputDir) {
  return new Promise((resolve, reject) => {
    const soffice = getLibreOfficePath();
    execFile(
      soffice,
      ['--headless', '--convert-to', format, '--outdir', outputDir, inputPath],
      { timeout: 60000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(`LibreOffice error: ${stderr || err.message}`));
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(outputDir, `${baseName}.${format}`);
        if (!fs.existsSync(outputPath)) {
          return reject(new Error('Conversion produced no output file'));
        }
        resolve(outputPath);
      }
    );
  });
}

module.exports = { convertWithLibreOffice };
