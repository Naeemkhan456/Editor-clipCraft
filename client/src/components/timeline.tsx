import type { Project } from "@shared/schema";

interface TimelineProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function Timeline({ project, currentTime, onSeek }: TimelineProps) {
  // Generate mock frames for timeline
  const frameCount = 20;
  const frames = Array.from({ length: frameCount }, (_, i) => ({
    id: i,
    time: (i / frameCount) * (project.duration || 15),
    thumbnail: project.thumbnail || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=80&fit=crop",
  }));

  const handleFrameClick = (time: number) => {
    onSeek(time);
  };

  return (
    <div className="px-4 py-4 bg-secondary">
      <div className="timeline-track">
        {frames.map((frame, index) => {
          const isActive = Math.abs(frame.time - currentTime) < 1;
          
          return (
            <div
              key={frame.id}
              className="flex-shrink-0 relative"
              onClick={() => handleFrameClick(frame.time)}
            >
              <img
                src={frame.thumbnail}
                alt={`Frame ${index + 1}`}
                className={`timeline-frame ${
                  isActive ? "border-accent" : ""
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
  );
}
