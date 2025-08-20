import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, SkipBack, SkipForward, Scissors, Crop, RotateCcw, 
  Download, Upload, Volume2, Settings, Plus, Trash2, RotateCcwSquare,
  Undo,
  ArrowLeft,
  Palette,
  Redo
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VideoProcessor } from '@/lib/video-processor';
import { cn } from '@/lib/utils';
import { useVideoEditor } from '@/hooks/use-video-editor';
import { useParams } from 'wouter';

interface VideoState {
  file: File | null;
  url: string;
  duration: number;
  currentTime: number;
  volume: number;
  playbackRate: number;
  isPlaying: boolean;
  crop: { x: number; y: number; width: number; height: number };
  trim: { start: number; end: number };
  rotation: number;
  isMuted: boolean;
}

export default function VideoEditorFixed() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoState, setVideoState] = useState<VideoState>({
    file: null,
    url: '',
    duration: 0,
    currentTime: 0,
    volume: 1,
    playbackRate: 1,
    isPlaying: false,
    crop: { x: 0, y: 0, width: 100, height: 100 },
    trim: { start: 0, end: 0 },
    rotation: 0,
    isMuted: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Processing...");
  const [activeTool, setActiveTool] = useState("speed");
  const [showSettings, setShowSettings] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [showTrimTool, setShowTrimTool] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Use the video editor hook
  const {
    isPlaying,
    currentTime,
    duration,
    speed,
    canUndo,
    canRedo,
    togglePlayback,
    seekTo,
    setSpeed,
    setCurrentTime: setEditorTime,
    setDuration: setEditorDuration,
    undo,
    redo,
  } = useVideoEditor(undefined);

  // Video upload handler
  const handleVideoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid video file.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoState(prev => ({
      ...prev,
      file,
      url,
      duration: 0,
      currentTime: 0,
      trim: { start: 0, end: 0 }
    }));

    // Reset video element
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }

    toast({
      title: "Video uploaded",
      description: "Your video has been loaded successfully.",
    });
  }, []);

  // Video metadata handler
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const newDuration = videoRef.current.duration;
      setVideoState(prev => ({
        ...prev,
        duration: newDuration,
        trim: { start: 0, end: newDuration }
      }));
      setEditorDuration(newDuration);
    }
  }, [setEditorDuration]);

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      setVideoState(prev => ({ ...prev, currentTime: newTime }));
      setEditorTime(newTime);
    }
  }, [setEditorTime]);

  // Playback control
  const handleTogglePlayback = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    togglePlayback();
  }, [isPlaying, togglePlayback]);

  // Seek handler
  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    
    const clampedTime = Math.max(0, Math.min(videoState.duration, time));
    videoRef.current.currentTime = clampedTime;
    seekTo(clampedTime);
  }, [videoState.duration, seekTo]);

  // Crop handler
  const handleCrop = useCallback(async (cropData: { x: number; y: number; width: number; height: number }) => {
    if (!videoState.file) return;

    setIsProcessing(true);
    setProcessingStatus("Cropping video...");

    try {
      const processor = new VideoProcessor();
      const croppedBlob = await processor.cropVideo(
        videoState.file,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height
      );

      const newFile = new File([croppedBlob], 'cropped-video.mp4', { type: 'video/mp4' });
      const newUrl = URL.createObjectURL(newFile);
      
      setVideoState(prev => ({
        ...prev,
        file: newFile,
        url: newUrl,
        crop: cropData
      }));

      if (videoRef.current) {
        videoRef.current.src = newUrl;
        videoRef.current.load();
      }

      toast({
        title: "Video cropped",
        description: "Your video has been cropped successfully.",
      });
    } catch (error) {
      toast({
        title: "Crop failed",
        description: "Failed to crop the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [videoState.file]);

  // Trim handler
  const handleTrim = useCallback(async (start: number, end: number) => {
    if (!videoState.file) return;

    setIsProcessing(true);
    setProcessingStatus("Trimming video...");

    try {
      const processor = new VideoProcessor();
      const trimmedBlob = await processor.trimVideo(videoState.file, start, end);
      
      const newFile = new File([trimmedBlob], 'trimmed-video.mp4', { type: 'video/mp4' });
      const newUrl = URL.createObjectURL(newFile);
      
      setVideoState(prev => ({
        ...prev,
        file: newFile,
        url: newUrl,
        duration: end - start,
        currentTime: 0,
        trim: { start, end }
      }));

      if (videoRef.current) {
        videoRef.current.src = newUrl;
        videoRef.current.load();
      }

      setEditorDuration(end - start);
      setEditorTime(0);

      toast({
        title: "Video trimmed",
        description: "Your video has been trimmed successfully.",
      });
    } catch (error) {
      toast({
        title: "Trim failed",
        description: "Failed to trim the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [videoState.file, setEditorDuration, setEditorTime]);

  // Speed change handler
  const handleSpeedChange = useCallback((newSpeed: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = newSpeed;
    setVideoState(prev => ({ ...prev, playbackRate: newSpeed }));
    setSpeed(newSpeed);
  }, [setSpeed]);

  // Volume change handler
  const handleVolumeChange = useCallback((volume: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = volume;
    setVideoState(prev => ({ ...prev, volume }));
  }, []);

  // Rotation handler
  const handleRotation = useCallback((degrees: number) => {
    setVideoState(prev => ({ ...prev, rotation: degrees }));
  }, []);

  // Export handler
  const handleExport = useCallback(async () => {
    if (!videoState.file) {
      toast({
        title: "No video",
        description: "Please load a video first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Preparing export...");

    try {
      const processor = new VideoProcessor();
      const processedBlob = await processor.processVideo({
        inputFile: videoState.file,
        outputFormat: 'mp4',
        resolution: '1080p',
        aspectRatio: '16:9',
        speed: videoState.playbackRate
      });

      const url = URL.createObjectURL(processedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-video.mp4';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Your edited video has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [videoState]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
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
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-secondary border-r p-4">
          <h2 className="text-sm font-semibold mb-4">Tools</h2>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowCropTool(true)}
            >
              <Crop className="w-4 h-4 mr-2" />
              Crop
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowTrimTool(true)}
            >
              <Scissors className="w-4 h-4 mr-2" />
              Trim
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowFilters(true)}
            >
              <Palette className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            <video
              ref={videoRef}
              className="max-w-full max-h-full"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              style={{
                transform: `rotate(${videoState.rotation}deg)`,
                filter: `brightness(${100}%) contrast(${100}%) saturate(${100}%)`
              }}
            />
            
            {!videoState.url && (
              <div className="text-center text-gray-400">
                <Upload className="w-16 h-16 mx-auto mb-4" />
                <p>Upload a video to get started</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-secondary p-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSeek(Math.max(0, currentTime - 5))}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTogglePlayback}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSeek(Math.min(duration, currentTime + 5))}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={([value]) => handleSeek(value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Speed</label>
                <Slider
                  value={[speed]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) => handleSpeedChange(value)}
                />
                <span className="text-xs text-gray-400">{speed}x</span>
              </div>
              
              <div>
                <label className="text-sm font-medium">Volume</label>
                <Slider
                  value={[videoState.volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => handleVolumeChange(value)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleVideoUpload(file);
        }}
      />

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Processing</h3>
            <p className="text-sm text-gray-600 mb-4">{processingStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Crop Video</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Adjust crop area:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">X Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={videoState.crop.x}
                    onChange={(e) => setVideoState(prev => ({ 
                      ...prev, 
                      crop: { ...prev.crop, x: Number(e.target.value) }
                    }))}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm">Y Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={videoState.crop.y}
                    onChange={(e) => setVideoState(prev => ({ 
                      ...prev, 
                      crop: { ...prev.crop, y: Number(e.target.value) }
                    }))}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm">Width (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={videoState.crop.width}
                    onChange={(e) => setVideoState(prev => ({ 
                      ...prev, 
                      crop: { ...prev.crop, width: Number(e.target.value) }
                    }))}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm">Height (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={videoState.crop.height}
                    onChange={(e) => setVideoState(prev => ({ 
                      ...prev, 
                      crop: { ...prev.crop, height: Number(e.target.value) }
                    }))}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCropTool(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCrop(videoState.crop)}>
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trim Modal */}
      {showTrimTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Trim Video</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Set trim points:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Start Time (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    max={videoState.duration}
                    value={videoState.trim.start}
                    onChange={(e) => setVideoState(prev => ({ 
                      ...prev, 
                      trim: { ...prev.trim, start: Number(e.target.value) }
                    }))}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm">End Time (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    max={videoState.duration}
                    value={videoState.trim.end}
                    onChange={(e) => setVideoState(prev => ({ 
                      ...prev, 
                      trim: { ...prev.trim, end: Number(e.target.value) }
                    }))}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTrimTool(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleTrim(videoState.trim.start, videoState.trim.end)}>
                Apply Trim
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
