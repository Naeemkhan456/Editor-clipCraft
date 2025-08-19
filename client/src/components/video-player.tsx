import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@shared/schema";

interface VideoPlayerProps {
  project: Project;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayback: () => void;
  onSeek: (time: number) => void;
}

export default function VideoPlayer({
  project,
  isPlaying,
  currentTime,
  duration,
  onTogglePlayback,
  onSeek,
}: VideoPlayerProps) {
  const [showControls, setShowControls] = useState(false);

  const aspectRatioClass = {
    "16:9": "aspect-video",
    "9:16": "aspect-tiktok", 
    "1:1": "aspect-square",
  }[project.aspectRatio] || "aspect-video";

  const handleSkipBackward = () => {
    onSeek(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    onSeek(Math.min(duration, currentTime + 10));
  };

  return (
    <div
      className={`bg-black relative ${aspectRatioClass}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video/Image Preview */}
      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt="Video preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-gray-500 text-center">
            <div className="text-6xl mb-4">📹</div>
            <div>No video loaded</div>
          </div>
        </div>
      )}

      {/* Playback Controls Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center glass-effect transition-opacity ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBackward}
            className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePlayback}
            className="p-4 rounded-full bg-accent hover:bg-blue-600 text-white"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipForward}
            className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="h-1 bg-black bg-opacity-30 rounded-full">
          <div
            className="h-1 bg-accent rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
