import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, '../public/og-image.svg');
const outputPath = join(__dirname, '../public/og-image.png');

const svgBuffer = readFileSync(svgPath);

sharp(svgBuffer)
  .resize(1200, 630)
  .png()
  .toFile(outputPath)
  .then(() => console.log('OG image generated: og-image.png'))
  .catch(err => console.error('Error generating OG image:', err));
