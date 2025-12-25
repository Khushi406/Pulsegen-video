// Lightweight sensitivity analysis using ffprobe metadata
const ffmpeg = require('./ffmpegConfig');

module.exports = function analyzeSensitivity(filePath) {
  return new Promise((resolve, reject) => {
    // Use ffprobe to extract duration and stream info
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        // fallback to unknown
        return resolve({ result: 'unknown', metadata: null });
      }

      const format = metadata.format || {};
      const duration = format.duration ? Number(format.duration) : 0;
      const streams = metadata.streams || [];
      const videoStream = streams.find(s => s.codec_type === 'video') || {};
      const width = videoStream.width || 0;
      const height = videoStream.height || 0;

      // Simple heuristic: very long videos or very large resolution marked flagged
      let result = 'safe';
      if (duration > 60 * 60) result = 'flagged'; // > 1 hour
      if (width >= 3840 || height >= 2160) result = 'flagged'; // >= 4K

      resolve({ result, metadata: { duration, width, height } });
    });
  });
};
