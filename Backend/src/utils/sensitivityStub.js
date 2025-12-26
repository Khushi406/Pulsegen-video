// Realistic sensitivity/quality analysis using ffprobe and an ffmpeg integrity pass
const ffmpeg = require('./ffmpegConfig');

function toNullPath() {
  return process.platform === 'win32' ? 'NUL' : '/dev/null';
}

module.exports = function analyzeSensitivity(filePath) {
  return new Promise((resolve) => {
    // First, probe metadata
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      const resultMeta = metadata || null;
      let duration = 0;
      try { duration = metadata && metadata.format && Number(metadata.format.duration) || 0 } catch (e) { duration = 0 }

      // Run a quick ffmpeg pass to verify integrity (transcode to null)
      const out = toNullPath();
      let flagged = false;
      const cmd = ffmpeg(filePath)
        .outputOptions(['-map 0', '-c copy', '-f null'])
        .output(out)
        .on('error', (err) => {
          // If ffmpeg errors during processing, mark as flagged
          flagged = true;
        })
        .on('end', () => {
          // Use simple heuristic: errors => flagged, else safe/unknown based on duration
          let result = 'safe';
          if (flagged) result = 'flagged';
          else if (duration === 0) result = 'unknown';
          resolve({ result, metadata: resultMeta });
        });

      // Start the process
      try {
        cmd.run();
      } catch (e) {
        // If running fails, return unknown
        resolve({ result: 'unknown', metadata: resultMeta });
      }
    });
  });
};
