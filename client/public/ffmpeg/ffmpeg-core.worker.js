// Simple worker stub for FFmpeg
// This is a minimal worker implementation for FFmpeg

self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      // Initialize worker
      self.postMessage({ type: 'ready' });
      break;

    case 'run':
      // Handle FFmpeg commands
      // This is a simplified implementation
      self.postMessage({ type: 'done', data: data });
      break;

    default:
      self.postMessage({ type: 'error', message: 'Unknown message type' });
  }
};
