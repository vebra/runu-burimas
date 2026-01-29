import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(__dirname, '../public/icons/icon.svg');
const outputDir = join(__dirname, '../public/icons');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  for (const size of sizes) {
    const outputFile = join(outputDir, `icon-${size}x${size}.png`);

    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputFile);

    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(join(outputDir, 'apple-touch-icon.png'));
  console.log('✓ Generated: apple-touch-icon.png');

  // Generate favicon (32x32)
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(join(outputDir, 'favicon-32x32.png'));
  console.log('✓ Generated: favicon-32x32.png');

  // Generate favicon (16x16)
  await sharp(inputSvg)
    .resize(16, 16)
    .png()
    .toFile(join(outputDir, 'favicon-16x16.png'));
  console.log('✓ Generated: favicon-16x16.png');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
