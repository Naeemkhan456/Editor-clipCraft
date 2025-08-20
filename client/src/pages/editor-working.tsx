import React, { useState, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Play, Pause, Crop, Scissors, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import AddMediaModal from '@/components/add-media-modal';
import CropTool from '@/components/crop-tool';
import TrimTool from '@/components/trim-tool';

interface MediaFile {
  file: File;
  url: string;
  type: 'video' | 'image' | 'audio';
  duration?: number;
}

interface VideoState {
  currentFile: MediaFile | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  cropArea: { x: number; y: number; width: number; height: number };
  trimRange: { start: number; end: number };
}

export default function EditorWorking() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  const [videoState, setVideoState] = useState<VideoState>({
    currentFile: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    cropArea: { x: 0, y: 0, width: 100, height: 100 },
    trimRange: { start: 0, end: 0 }
  });

  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [showTrimTool, setShowTrimTool] = useState(false);

  const handleFileUpload = useCallback((file: File, type: 'video' | 'image' | 'audio') => {
    const url = URL.createObjectURL(file);
    const newFile: MediaFile = { file, url, type };
    
    setVideoState(prev => ({
      ...prev,
      currentFile: newFile,
      isPlaying: false,
      currentTime: 0,
      duration: 0
    }));
    
    toast({
      title: "File uploaded",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} file has been uploaded successfully.`,
    });
  }, [toast]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoState(prev => ({
        ...prev,
        duration: videoRef.current!.duration
      }));
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setVideoState(prev => ({
        ...prev,
        currentTime: videoRef.current!.currentTime
      }));
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setVideoState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [videoState.isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return;
    const clampedTime = Math.max(0, Math.min(videoState.duration, time));
    videoRef.current.currentTime = clampedTime;
    setVideoState(prev => ({ ...prev, currentTime: clampedTime }));
  }, [videoState.duration]);

  const handleCrop = useCallback((cropArea: { x: number; y: number; width: number; height: number }) => {
    setVideoState(prev => ({ ...prev, cropArea }));
    setShowCropTool(false);
    toast({ title: "Crop applied", description: "Crop settings have been applied." });
  }, [toast]);

  const handleTrim = useCallback((start: number, end: number) => {
    setVideoState(prev => ({ ...prev, trimRange: { start, end } }));
    setShowTrimTool(false);
    toast({ title: "Trim applied", description: "Trim settings have been applied." });
  }, [toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-secondary border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Video Editor</h1>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 bg-secondary border-r p-4">
          <h2 className="text-sm font-semibold mb-4">Tools</h2>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowAddMedia(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Media
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowCropTool(true)}
              disabled={!videoState.currentFile}
            >
              <Crop className="w-4 h-4 mr-2" />
              Crop
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowTrimTool(true)}
              disabled={!videoState.currentFile || videoState.currentFile.type !== 'video'}
            >
              <Scissors className="w-4 h-4 mr-2" />
              Trim
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {videoState.currentFile ? (
              videoState.currentFile.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={videoState.currentFile.url}
                  className="max-w-full max-h-full"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <img
                  src={videoState.currentFile.url}
                  alt="Uploaded"
                  className="max-w-full max-h-full"
                />
              )
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-16 h-16 mx-auto mb-4" />
                <p>Upload a video or image to get started</p>
                <Button
                  onClick={() => setShowAddMedia(true)}
                  className="mt-4"
                >
                  Add Media
                </Button>
              </div>
            )}
          </div>

          {videoState.currentFile?.type === 'video' && (
            <div className="bg-secondary p-4">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => seekTo(Math.max(0, videoState.currentTime - 5))}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayback}
                >
                  {videoState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => seekTo(Math.min(videoState.duration, videoState.currentTime + 5))}
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{formatTime(videoState.currentTime)}</span>
                  <span>{formatTime(videoState.duration)}</span>
                </div>
                <Slider
                  value={[videoState.currentTime]}
                  max={videoState.duration}
                  step={0.1}
                  onValueChange={([value]) => seekTo(value)}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Speed</label>
                  <Slider
                    value={[videoState.playbackRate]}
                    min={0.1}
                    max={3}
                    step={0.1}
                    onValueChange={([value]) => {
                      setVideoState(prev => ({ ...prev, playbackRate: value }));
                      if (videoRef.current) {
                        videoRef.current.playbackRate = value;
                      }
                    }}
                  />
                  <span className="text-xs text-gray-400">{videoState.playbackRate}x</span>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Volume</label>
                  <Slider
                    value={[videoState.volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={([value]) => {
                      setVideoState(prev => ({ ...prev, volume: value }));
                      if (videoRef.current) {
                        videoRef.current.volume = value;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AddMediaModal
        isOpen={showAddMedia}
        onClose={() => setShowAddMedia(false)}
        onFileSelected={handleFileUpload}
      />

      {showCropTool && (
        <CropTool
          onCrop={handleCrop}
          onCancel={() => setShowCropTool(false)}
        />
      )}

      {showTrimTool && (
    <TrimTool
      videoElement={videoRef.current || undefined}
      duration={videoRef.current?.duration || 0}
      onTrim={handleTrim}
      onCancel={() => setShowTrimTool(false)}
    />
      )}
    </div>
  );
}
