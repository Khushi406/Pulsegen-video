import React from "react";

export default function VideoPlayer({ video, onClose }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {video.originalName || video.filename}
              </h3>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(video.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video Player */}
          <div className="bg-black">
            <video
              controls
              autoPlay
              className="w-full"
              src={`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/api/stream/${video._id}`}
            >
              Your browser does not support video playback.
            </video>
          </div>

          {/* Video Details */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  video.status === "processed"
                    ? "bg-green-100 text-green-800"
                    : video.status === "processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {video.status}
                </span>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Sensitivity</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  video.sensitivity === "safe"
                    ? "bg-green-100 text-green-800"
                    : video.sensitivity === "flagged"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {video.sensitivity || "unknown"}
                </span>
              </div>

              {video.size && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">File Size</p>
                  <p className="text-sm font-medium text-gray-900">
                    {(video.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
