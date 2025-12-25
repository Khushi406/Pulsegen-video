const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = (() => {
  try {
    return require('@ffprobe-installer/ffprobe');
  } catch (e) {
    return null;
  }
})();
const ffmpeg = require('fluent-ffmpeg');

// Configure paths from installer packages when available
if (ffmpegInstaller && ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller && ffprobeInstaller.path) {
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

module.exports = ffmpeg;
