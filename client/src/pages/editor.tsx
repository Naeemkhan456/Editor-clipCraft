import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Undo, Redo, Play, Pause, SkipBack, SkipForward, Plus, Trash2, Upload, Scissors, Crop, Palette, Type, Music } from "lucide-react";

import VideoPlayer from "@/components/video-player";
import Timeline from "@/components/timeline";
import ExportModal from "@/components/export-modal";
import ProcessingModal from "@/components/processing-modal";
import VideoUpload from "@/components/video-upload";
import CropTool from "@/components/crop-tool";
import FiltersPanel from "@/components/filters-panel";
import TrimTool from "@/components/trim-tool";
import AudioWaveform from "@/components/audio-waveform";
import { Button } from "@/components/ui/button";
import { useVideoEditor } from "@/hooks/use-video-editor";
import { useToast } from "@/hooks/use-toast";
import { videoProcessor } from "@/lib/video-processor";
import { predefinedFilters, type FilterOptions } from "@/lib/filters";
import type { Project } from "@shared/schema";

export default function EditorPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showExportModal, setShowExportModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Processing...");
  const [activeTool, setActiveTool] = useState("speed");
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showTrimTool, setShowTrimTool] = useState(false);
  
  // Media states
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);
  const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", id],
  });

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
    setCurrentTime,
    setDuration,
    undo,
    redo,
  } = useVideoEditor(project);

  // Always render the full component structure to maintain hook consistency
  // The project data will be handled within the main render

  const tools = [
    { id: "trim", icon: Scissors, label: "Trim", action: () => setShowTrimTool(true) },
    { id: "speed", icon: SkipForward, label: "Speed", action: () => setActiveTool("speed") },
    { id: "crop", icon: Crop, label: "Crop", action: () => setShowCropTool(true) },
    { id: "filters", icon: Palette, label: "Filters", action: () => setShowFiltersPanel(true) },
    { id: "text", icon: Type, label: "Text", action: () => setActiveTool("text") },
    { id: "audio", icon: Music, label: "Audio", action: () => setActiveTool("audio") },
  ];

  // Sync video playback with state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play(); // ✅
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync video time with state
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // File upload handler
  const handleFileSelected = async (file: File, type: "video" | "image" | "audio") => {
    try {
      if (type === "video") {
        setCurrentVideoFile(file);
        const url = URL.createObjectURL(file);
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.load(); // Force reload
          setVideoElement(videoRef.current);
        }
        setShowUploadModal(false);
        toast({
          title: "Video loaded",
          description: "Video file has been loaded successfully.",
        });
      } else if (type === "audio") {
        setCurrentAudioFile(file);
        setShowUploadModal(false);
        toast({
          title: "Audio loaded", 
          description: "Audio file has been loaded successfully.",
        });
      } else if (type === "image") {
        // Handle image as video frame
        setShowUploadModal(false);
        toast({
          title: "Image loaded",
          description: "Image has been added to timeline.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load media file.",
        variant: "destructive",
      });
    }
  };

  // Trim handler
  const handleTrim = async (startTime: number, endTime: number) => {
    if (!currentVideoFile) {
      toast({
        title: "Error",
        description: "No video loaded for trimming.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Trimming video...");
    setShowTrimTool(false);

    try {
      const trimmedBlob = await videoProcessor.trimVideo(currentVideoFile, startTime, endTime);
      const trimmedFile = new File([trimmedBlob], "trimmed.mp4", { type: "video/mp4" });
      setCurrentVideoFile(trimmedFile);
      
      const url = URL.createObjectURL(trimmedFile);
      if (videoRef.current) {
        videoRef.current.src = url;
      }

      toast({
        title: "Video trimmed",
        description: "Video has been trimmed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trim video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Crop handler
  const handleCrop = async (cropArea: { x: number, y: number, width: number, height: number }) => {
    if (!currentVideoFile) {
      toast({
        title: "Error",
        description: "No video loaded for cropping.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Cropping video...");
    setShowCropTool(false);

    try {
      // Convert percentage-based crop to pixel values
      if (videoElement) {
        const videoWidth = videoElement.videoWidth || 1920;
        const videoHeight = videoElement.videoHeight || 1080;
        
        const x = Math.round((cropArea.x / 100) * videoWidth);
        const y = Math.round((cropArea.y / 100) * videoHeight);
        const width = Math.round((cropArea.width / 100) * videoWidth);
        const height = Math.round((cropArea.height / 100) * videoHeight);
        
        const croppedBlob = await videoProcessor.cropVideo(currentVideoFile, x, y, width, height);
        const croppedFile = new File([croppedBlob], "cropped.mp4", { type: "video/mp4" });
        setCurrentVideoFile(croppedFile);
        
        const url = URL.createObjectURL(croppedFile);
        videoRef.current!.src = url;

        toast({
          title: "Video cropped",
          description: "Video has been cropped successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to crop video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply speed change - simplified for immediate feedback
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    toast({
      title: "Speed changed",
      description: `Video speed set to ${newSpeed}x`,
    });
  };

  // Apply filters
  const handleFiltersChange = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    // Real-time filter preview would be applied to video element here
    if (videoElement) {
      let filterString = "";
      if (filters.brightness !== undefined) filterString += `brightness(${filters.brightness}%) `;
      if (filters.contrast !== undefined) filterString += `contrast(${filters.contrast}%) `;
      if (filters.saturation !== undefined) filterString += `saturate(${filters.saturation}%) `;
      if (filters.hue !== undefined) filterString += `hue-rotate(${filters.hue}deg) `;
      if (filters.blur !== undefined) filterString += `blur(${filters.blur}px) `;
      if (filters.sepia !== undefined) filterString += `sepia(${filters.sepia}%) `;
      
      videoElement.style.filter = filterString.trim() || "none";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExport = async (settings: any) => {
    setShowExportModal(false);
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen">
      
      {/* Editor Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-secondary">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-lg font-semibold truncate mx-4">{project?.name || "New Project"}</h1>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            className={`${!canUndo ? "text-gray-600" : "text-gray-400 hover:text-white"}`}
          >
            <Undo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            className={`${!canRedo ? "text-gray-600" : "text-gray-400 hover:text-white"}`}
          >
            <Redo className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Preview */}
      {currentVideoFile ? (
        <div className="flex-1 flex items-center justify-center bg-black relative">
          <video
            ref={videoRef}
            className="max-w-full max-h-full object-contain"
            controls={false}
            onClick={togglePlayback}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            style={{ filter: Object.keys(currentFilters).length > 0 ? 
              Object.entries(currentFilters).map(([key, value]) => {
                switch(key) {
                  case 'brightness': return `brightness(${value}%)`;
                  case 'contrast': return `contrast(${value}%)`;
                  case 'saturation': return `saturate(${value}%)`;
                  case 'hue': return `hue-rotate(${value}deg)`;
                  case 'blur': return `blur(${value}px)`;
                  case 'sepia': return `sepia(${value}%)`;
                  default: return '';
                }
              }).join(' ') : 'none'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && (
              <div className="bg-black bg-opacity-50 rounded-full p-4">
                <Play className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center text-gray-400">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-lg mb-2">No video loaded</p>
            <p className="text-sm">Tap "Add Media" to get started</p>
          </div>
        </div>
      )}

      {/* Playback Timeline */}
      <div className="px-4 py-3 bg-secondary">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <div className="h-1 bg-gray-600 rounded-full">
              <div 
                className="h-1 bg-accent rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-pointer"
              style={{ left: `${(currentTime / duration) * 100}%` }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (rect) {
                  const percent = (e.clientX - rect.left) / rect.width;
                  seekTo(percent * duration);
                }
              }}
            ></div>
          </div>
          <span className="text-sm text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Editing Tools */}
      <div className="px-4 py-3 bg-gray-800">
        <div className="flex justify-around">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  tool.action();
                }}
                className={`tool-button ${activeTool === tool.id ? "active-tool" : ""}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {currentVideoFile && (
        <div className="px-4 py-3 bg-gray-800">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-accent">🎬</span>
            <span className="text-sm text-gray-300">Video Timeline</span>
          </div>
          <div className="relative bg-gray-700 h-12 rounded-lg overflow-hidden">
            <div className="flex h-full items-end space-x-px p-2">
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent opacity-60"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                  }}
                  onClick={() => {
                    const newTime = (i / 50) * duration;
                    seekTo(newTime);
                  }}
                ></div>
              ))}
            </div>
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Speed Control (Active Tool) */}
      {activeTool === "speed" && (
        <div className="px-4 py-4 bg-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Speed</span>
            <div className="bg-accent px-3 py-1 rounded-full">
              <span className="text-sm font-medium">{speed.toFixed(1)}x</span>
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0.1x</span>
            <span>1.0x</span>
            <span>3.0x</span>
          </div>
        </div>
      )}

      {/* Audio Waveform */}
      {currentAudioFile && activeTool === "audio" && (
        <div className="px-4 py-3 bg-gray-800">
          <AudioWaveform 
            audioFile={currentAudioFile}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onDurationChange={(newDuration) => {}}
          />
        </div>
      )}

      {/* Add Media Button */}
      <div className="p-4">
        <Button
          onClick={() => setShowUploadModal(true)}
          className="w-full bg-accent hover:bg-blue-600 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Media</span>
        </Button>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <VideoUpload 
          onFileSelected={handleFileSelected}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {showCropTool && videoElement && (
        <CropTool
          videoElement={videoElement}
          onCrop={handleCrop}
          onCancel={() => setShowCropTool(false)}
        />
      )}

      {showFiltersPanel && (
        <FiltersPanel
          currentFilters={currentFilters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFiltersPanel(false)}
        />
      )}

      {showTrimTool && videoElement && (
        <TrimTool
          videoElement={videoElement}
          duration={duration}
          onTrim={handleTrim}
          onCancel={() => setShowTrimTool(false)}
        />
      )}

      {/* Hidden video element for processing - only used when video is not displayed in main preview */}
      {!currentVideoFile && (
        <video 
          ref={videoRef}
          className="hidden"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
        />
      )}

      {/* Bottom Actions */}
      <div className="px-4 py-4 bg-secondary">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="p-3 bg-gray-800 rounded-full hover:bg-gray-700"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-3 bg-gray-800 rounded-full hover:bg-error hover:text-white"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            onClick={() => setShowExportModal(true)}
            className="btn-primary"
          >
            Export
          </Button>
        </div>
      </div>

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <ProcessingModal 
        isOpen={isProcessing}
        progress={processingProgress}
        status={processingStatus}
      />
    </div>
  );
}