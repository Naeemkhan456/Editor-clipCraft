import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioWaveformProps {
  audioFile?: File;
  audioUrl?: string;
  height?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  currentTime?: number;
  isPlaying?: boolean;
}

export default function AudioWaveform({
  audioFile,
  audioUrl,
  height = 60,
  onTimeUpdate,
  onDurationChange,
  currentTime = 0,
  isPlaying = false,
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer
    waveSurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4F46E5',
      progressColor: '#3B82F6',
      cursorColor: '#FFFFFF',
      barWidth: 2,
      barRadius: 1,

      height: height,
      normalize: true,

      mediaControls: false,
    });

    const waveSurfer = waveSurferRef.current;

    // Event listeners
    waveSurfer.on('ready', () => {
      setIsReady(true);
      const duration = waveSurfer.getDuration();
      onDurationChange?.(duration);
    });

    waveSurfer.on('audioprocess', () => {
      const currentTime = waveSurfer.getCurrentTime();
      onTimeUpdate?.(currentTime);
    });

    waveSurfer.on('interaction', () => {
      const currentTime = waveSurfer.getCurrentTime();
      onTimeUpdate?.(currentTime);
    });

    // Load audio
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      waveSurfer.load(url);
    } else if (audioUrl) {
      waveSurfer.load(audioUrl);
    }

    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
    };
  }, [audioFile, audioUrl, height]);

  // Sync with external playback state
  useEffect(() => {
    if (!waveSurferRef.current || !isReady) return;

    if (isPlaying) {
      waveSurferRef.current.play();
    } else {
      waveSurferRef.current.pause();
    }
  }, [isPlaying, isReady]);

  // Sync with external current time
  useEffect(() => {
    if (!waveSurferRef.current || !isReady) return;

    const waveSurferTime = waveSurferRef.current.getCurrentTime();
    if (Math.abs(waveSurferTime - currentTime) > 0.5) {
      waveSurferRef.current.seekTo(currentTime / waveSurferRef.current.getDuration());
    }
  }, [currentTime, isReady]);

  const togglePlayPause = () => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.playPause();
  };

  const toggleMute = () => {
    if (!waveSurferRef.current) return;
    
    if (isMuted) {
      waveSurferRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      waveSurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!waveSurferRef.current) return;
    
    setVolume(newVolume);
    if (!isMuted) {
      waveSurferRef.current.setVolume(newVolume);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center space-x-3 mb-3">
        <Button
          onClick={togglePlayPause}
          variant="ghost"
          size="icon"
          disabled={!isReady}
          className="p-2 rounded-full bg-gray-700 hover:bg-accent"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <span className="text-sm text-gray-300 flex items-center">
          🎵 Background Music
        </span>

        <div className="flex items-center space-x-2 ml-auto">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="p-1"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div ref={containerRef} className="w-full" />
      
      {!isReady && (
        <div className="flex items-center justify-center h-12 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
          <span className="ml-2 text-sm">Loading audio...</span>
        </div>
      )}
    </div>
  );
}