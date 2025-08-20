import { useState, useRef, useEffect } from "react";
import { Scissors, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrimToolProps {
  videoElement?: HTMLVideoElement;
  duration: number;
  onTrim: (startTime: number, endTime: number) => void;
  onCancel: () => void;
}

export default function TrimTool({ videoElement, duration, onTrim, onCancel }: TrimToolProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying && videoElement) {
      intervalRef.current = setInterval(() => {
        const time = videoElement.currentTime;
        setCurrentTime(time);
        
        // Auto-pause at end trim point
        if (time >= endTime) {
          setIsPlaying(false);
          videoElement.pause();
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, endTime, videoElement]);

  const togglePlayback = () => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      // Start from start trim point if at the end
      if (currentTime >= endTime) {
        videoElement.currentTime = startTime;
        setCurrentTime(startTime);
      }
      videoElement.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    const clampedTime = Math.max(startTime, Math.min(endTime, time));
    setCurrentTime(clampedTime);
    if (videoElement) {
      videoElement.currentTime = clampedTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const trimDuration = endTime - startTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-3xl w-full max-w-lg animate-slide-up">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Trim Video</h2>
            <p className="text-gray-400">Set start and end points</p>
          </div>

              {/* Video Preview */}
              {videoElement && (
                <div className="bg-black rounded-2xl mb-6 relative aspect-video">
                  <video
                    ref={(el) => {
                      if (el && videoElement) {
                        try {
                          if (videoElement.srcObject) {
                            el.srcObject = videoElement.srcObject;
                          } else if (videoElement.src) {
                            el.src = videoElement.src;
                          } else {
                            console.warn('Video element has no valid source');
                          }
                        } catch (error) {
                          console.error('Error setting video source:', error);
                        }
                      }
                    }}
                    className="w-full h-full object-contain rounded-2xl"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  
                  {/* Play/Pause Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={togglePlayback}
                      variant="ghost"
                      size="icon"
                      className="p-4 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

          {/* Timeline */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{formatTime(startTime)}</span>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(endTime)}</span>
            </div>
            
            <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
              {/* Full timeline */}
              <div className="absolute inset-0 bg-gray-700 opacity-50"></div>
              
              {/* Selected range */}
              <div 
                className="absolute top-0 bottom-0 bg-accent opacity-30"
                style={{
                  left: `${(startTime / duration) * 100}%`,
                  width: `${((endTime - startTime) / duration) * 100}%`,
                }}
              ></div>
              
              {/* Current time indicator */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              ></div>
              
              {/* Start handle */}
              <div 
                className="absolute top-0 bottom-0 w-3 bg-accent cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${(startTime / duration) * 100}%` }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startValue = startTime;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const timeline = e.currentTarget as HTMLElement;
                    const parentElement = timeline.parentElement;
                    if (!parentElement) return;
                    
                    const timelineRect = parentElement.getBoundingClientRect();
                    const deltaTime = (deltaX / timelineRect.width) * duration;
                    const newStartTime = Math.max(0, Math.min(endTime - 0.1, startValue + deltaTime));
                    setStartTime(newStartTime);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="w-1 h-4 bg-white rounded"></div>
              </div>
              
              {/* End handle */}
              <div 
                className="absolute top-0 bottom-0 w-3 bg-accent cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${(endTime / duration) * 100}%`, marginLeft: '-12px' }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startValue = endTime;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const timeline = e.currentTarget as HTMLElement;
                    const parentElement = timeline.parentElement;
                    if (!parentElement) return;
                    
                    const timelineRect = parentElement.getBoundingClientRect();
                    const deltaTime = (deltaX / timelineRect.width) * duration;
                    const newEndTime = Math.max(startTime + 0.1, Math.min(duration, startValue + deltaTime));
                    setEndTime(newEndTime);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="w-1 h-4 bg-white rounded"></div>
              </div>
              
              {/* Click to seek */}
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percent = x / rect.width;
                  seekTo(percent * duration);
                }}
              ></div>
            </div>
          </div>

          {/* Trim Info */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-sm text-gray-400">Start</div>
              <div className="font-semibold">{formatTime(startTime)}</div>
            </div>
            <div className="bg-accent bg-opacity-20 rounded-xl p-3">
              <div className="text-sm text-gray-400">Duration</div>
              <div className="font-semibold text-accent">{formatTime(trimDuration)}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-sm text-gray-400">End</div>
              <div className="font-semibold">{formatTime(endTime)}</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onCancel}
              variant="ghost"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onTrim(startTime, endTime)}
              className="flex-1 bg-accent hover:bg-blue-600"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Apply Trim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}