import { useState, useRef } from "react";
import type { Project } from "@shared/schema";

interface TimelineProps {
  project: Project;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function Timeline({ project, currentTime, duration, onSeek }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate mock frames for timeline
  const frameCount = 20;
  const frames = Array.from({ length: frameCount }, (_, i) => ({
    id: i,
    time: (i / frameCount) * duration,
    thumbnail: project.thumbnail || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=80&fit=crop",
  }));

  const handleFrameClick = (time: number) => {
    onSeek(time);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="px-4 py-4 bg-secondary">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <div 
        ref={timelineRef}
        className="relative h-12 bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
        onClick={handleTimelineClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Progress bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-accent opacity-50"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
        
        {/* Current time indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        ></div>
        
        {/* Timeline frames */}
        <div className="flex h-full items-center space-x-px p-2">
          {frames.map((frame, index) => {
            const isActive = Math.abs(frame.time - currentTime) < 1;
            
            return (
              <div
                key={frame.id}
                className="flex-shrink-0 relative"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFrameClick(frame.time);
                }}
              >
                <img
                  src={frame.thumbnail}
                  alt={`Frame ${index + 1}`}
                  className={`w-12 h-8 object-cover rounded ${
                    isActive ? "border-2 border-accent" : "border border-gray-600"
                  }`}
                />
                
                {/* Current frame indicator */}
                {isActive && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-accent"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
