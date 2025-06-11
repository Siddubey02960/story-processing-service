const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const path = require('path');

const mergeMediaWithMusic = (mediaPath, musicPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(mediaPath)
      .input(musicPath)
      .outputOptions([
        '-shortest',
        '-y'
      ])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
};

module.exports = { mergeMediaWithMusic };
