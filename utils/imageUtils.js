const sharp = require('sharp');

// Function to resize and compress an image
function optimizeImage(inputPath, outputPath) {
    return sharp(inputPath)
      .resize(206, 260) // Resize the image to a fixed width of 206px and a fixed height of 260px
      .webp({ quality: 80 }) // Compress the image as a WEBP with 80% quality
      .toFile(outputPath);
  }


module.exports = { optimizeImage };

