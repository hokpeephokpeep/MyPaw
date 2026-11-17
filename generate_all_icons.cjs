const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const svgPath = path.join(__dirname, 'For Icon', 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found in For Icon!');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Copy SVG to public/favicon.svg
  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), svgBuffer);
  console.log('✓ Updated public/favicon.svg');

  // 2. Generate PNGs in For Icon
  const forIconDir = path.join(__dirname, 'For Icon');
  const forIconSizes = [512, 192, 144, 96, 72, 48];
  for (const size of forIconSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(forIconDir, `icon_${size}x${size}.png`));
    console.log(`✓ Generated For Icon/icon_${size}x${size}.png`);
  }

  // 3. Generate public/paw_icon.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'paw_icon.png'));
  console.log('✓ Updated public/paw_icon.png (512x512)');

  // 4. Generate Android mipmap icons
  const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  const mipmaps = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  for (const [folder, dim] of Object.entries(mipmaps)) {
    const targetDir = path.join(androidResDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Square launcher icon
    await sharp(svgBuffer)
      .resize(dim, dim)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Round launcher icon
    await sharp(svgBuffer)
      .resize(dim, dim)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Foreground icon with safe margin (15% padding for adaptive icon)
    const pad = Math.round(dim * 0.15);
    const innerDim = dim - (pad * 2);
    const innerBuf = await sharp(svgBuffer)
      .resize(innerDim, innerDim)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: dim,
        height: dim,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerBuf, top: pad, left: pad }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✓ Updated Android ${folder} (${dim}x${dim})`);
  }

  console.log('\nAll icons successfully generated and synchronized!');
}

run().catch(console.error);
