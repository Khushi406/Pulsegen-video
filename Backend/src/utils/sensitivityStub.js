// Simple mock sensitivity analysis
module.exports = function analyzeSensitivity(filePath) {
  // This is a stub. Replace with real ML/FFmpeg processing.
  return new Promise((resolve) => {
    setTimeout(() => {
      const outcomes = ['safe', 'flagged', 'unknown'];
      const pick = outcomes[Math.floor(Math.random() * outcomes.length)];
      resolve({ result: pick });
    }, 2000);
  });
};
