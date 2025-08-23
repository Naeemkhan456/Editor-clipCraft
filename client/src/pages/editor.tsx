import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Undo, Redo, Play, Pause, SkipBack, SkipForward, Plus, Trash2, Upload, Scissors, Crop, Palette, Type, Music, Settings, LayoutTemplate, User, Zap } from "lucide-react";

import VideoPlayer from "@/components/video-player";
import Timeline from "@/components/timeline";
import ExportModal from "@/components/export-modal";
import ProcessingModal from "@/components/processing-modal";
import VideoUpload from "@/components/video-upload";
import CropTool from "@/components/crop-tool";
import FiltersPanel from "@/components/filters-panel";
import TrimTool from "@/components/trim-tool";
import AudioWaveform from "@/components/audio-waveform";
import SettingsModal from "@/components/settings-modal";
import TemplateModal from "@/components/template-modal";
import ProfileModal from "@/components/profile-modal";
import TextOverlay, { type TextOverlayData } from "@/components/text-overlay";
import Transitions, { type TransitionData } from "@/components/transitions";
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showTrimTool, setShowTrimTool] = useState(false);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const [showTransitions, setShowTransitions] = useState(false);
  
  // Media states
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);
  const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  // Enhanced editing states
  const [textOverlays, setTextOverlays] = useState<TextOverlayData[]>([]);
  const [transitions, setTransitions] = useState<TransitionData[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<TextOverlayData | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<TransitionData | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);

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
    { id: "text", icon: Type, label: "Text", action: () => setShowTextOverlay(true) },
    { id: "transitions", icon: Zap, label: "Transitions", action: () => setShowTransitions(true) },
    { id: "audio", icon: Music, label: "Audio", action: () => setActiveTool("audio") },
  ];

  // Ensure video element is set when videoRef is available
  useEffect(() => {
    if (videoRef.current && currentVideoFile && !videoElement) {
      console.log("Setting video element from useEffect");
      setVideoElement(videoRef.current);
    }
  }, [videoRef.current, currentVideoFile, videoElement]);

  // Debug video state changes
  useEffect(() => {
    console.log("Video state changed:", {
      hasVideoFile: !!currentVideoFile,
      hasVideoElement: !!videoElement,
      hasVideoRef: !!videoRef.current,
      videoUrl: videoUrl,
      isVideoLoading: isVideoLoading
    });
  }, [currentVideoFile, videoElement, videoRef.current, videoUrl, isVideoLoading]);

  // Set video source when currentVideoFile changes
  useEffect(() => {
    if (currentVideoFile && videoRef.current) {
      console.log("Setting video source for:", currentVideoFile.name);
      
      // Clean up previous video URL to prevent memory leaks
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      
      const url = URL.createObjectURL(currentVideoFile);
      setVideoUrl(url);
      
      // Clear existing event listeners
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
      
      // Set new source
      videoRef.current.src = url;
      videoRef.current.load();
      
      // Set up new event listeners
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded from useEffect");
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
          setVideoElement(videoRef.current);
          setCurrentTime(0);
          setIsVideoLoading(false);
        }
      };
      
      videoRef.current.onerror = (e) => {
        console.error("Video load error from useEffect:", e);
        setIsVideoLoading(false);
      };
    }
  }, [currentVideoFile]);

  // Sync video playback with state
  useEffect(() => {
    if (videoRef.current && videoRef.current.src) {
      try {
        // Apply speed to video element
        videoRef.current.playbackRate = speed;
        
        if (isPlaying) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log("Playback prevented:", error);
              // Don't show error for user-initiated actions
            });
          }
        } else {
          videoRef.current.pause();
        }
      } catch (error) {
        console.log("Playback error:", error);
      }
    }
  }, [isPlaying, speed]);

  // Sync video time with state
  useEffect(() => {
    if (videoRef.current && videoRef.current.src && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      try {
        videoRef.current.currentTime = currentTime;
      } catch (error) {
        console.log("Seek error:", error);
      }
    }
  }, [currentTime]);

  // File upload handler
  const handleFileSelected = async (file: File, type: "video" | "image" | "audio") => {
    console.log("File selected:", file.name, "Type:", type, "Size:", file.size);
    
    try {
      if (type === "video") {
        setIsVideoLoading(true);
        setCurrentVideoFile(file);
        // The useEffect will handle setting the video source
        
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
        setIsVideoLoading(true);
        setCurrentVideoFile(file);
        // The useEffect will handle setting the video source
        
        setShowUploadModal(false);
        toast({
          title: "Image loaded",
          description: "Image has been loaded successfully.",
        });
      }
    } catch (error) {
      console.error("File handling error:", error);
      setIsVideoLoading(false);
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

      // toast({
      //   title: "Video trimmed",
      //   description: "Video has been trimmed successfully.",
      // });
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
        
        const url = URL.createObjectURL(croppedBlob);
        videoRef.current!.src = url;

        // toast({
        //   title: "Video cropped",
        //   description: "Video has been cropped successfully.",
        // });
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

  // Text overlay handler
  const handleTextOverlay = (overlay: TextOverlayData) => {
    if (selectedOverlay) {
      // Edit existing overlay
      setTextOverlays(prev => prev.map(o => o.id === selectedOverlay.id ? overlay : o));
      setSelectedOverlay(null);
    } else {
      // Add new overlay
      setTextOverlays(prev => [...prev, overlay]);
    }
    setShowTextOverlay(false);
  };

  // Transition handler
  const handleTransition = (transition: TransitionData) => {
    if (selectedTransition) {
      // Edit existing transition
      setTransitions(prev => prev.map(t => t.id === selectedTransition.id ? transition : t));
      setSelectedTransition(null);
    } else {
      // Add new transition
      setTransitions(prev => [...prev, transition]);
    }
    setShowTransitions(false);
  };

  // Apply speed change - simplified for immediate feedback
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    // toast({
    //   title: "Speed changed",
    //   description: `Video speed set to ${newSpeed}x`,
    // });
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

  // Delete overlay
  const deleteOverlay = (overlayId: string) => {
    setTextOverlays(prev => prev.filter(o => o.id !== overlayId));
  };

  // Delete transition
  const deleteTransition = (transitionId: string) => {
    setTransitions(prev => prev.filter(t => t.id !== transitionId));
  };

  // Edit overlay
  const editOverlay = (overlay: TextOverlayData) => {
    setSelectedOverlay(overlay);
    setShowTextOverlay(true);
  };

  // Edit transition
  const editTransition = (transition: TransitionData) => {
    setSelectedTransition(transition);
    setShowTransitions(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX;
        touchStartTime.current = Date.now();
    } else if (e.touches.length === 2) {
        // Handle pinch-to-zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        // Store initial distance for zoom calculations
    }
};

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && videoRef.current && duration > 0) {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX.current;
      
      // Calculate time change based on swipe distance
      // 100px swipe = 5 seconds change
      const timeChange = (deltaX / 100) * 5;
      const newTime = Math.max(0, Math.min(duration, currentTime + timeChange));
      
      setCurrentTime(newTime);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;
      const touchDuration = Date.now() - touchStartTime.current;
      
      // Calculate momentum for smooth scrolling
      const velocity = deltaX / touchDuration;
      const momentumDistance = velocity * 300; // 300ms momentum
      
      if (Math.abs(momentumDistance) > 10 && videoRef.current && duration > 0) {
        const momentumTimeChange = (momentumDistance / 100) * 5;
        const newTime = Math.max(0, Math.min(duration, currentTime + momentumTimeChange));
        
        setCurrentTime(newTime);
        if (videoRef.current) {
          videoRef.current.currentTime = newTime;
        }
      }
    }
  };

  const handleExport = async (settings: any) => {
    setShowExportModal(false);
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  // Check if text overlay should be visible at current time
  const isOverlayVisible = (overlay: TextOverlayData) => {
    return currentTime >= overlay.startTime && currentTime <= overlay.endTime;
  };

  // Check if transition should be active at current time
  const isTransitionActive = (transition: TransitionData) => {
    return currentTime >= transition.startTime && currentTime <= transition.startTime + transition.duration;
  };

  return (
    <div className="flex flex-col h-screen">
      
      {/* Editor Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-secondary">
      <Button
  variant="ghost"
  size="icon"
  onClick={() => setLocation("/")}
  className="rounded-full hover:bg-[#6344fd]/30 text-[#6344fd] transition-all duration-200"
>
  <ArrowLeft className="w-5 h-5" />
</Button>

        
        <h1 className="text-lg font-semibold truncate mx-4">{project?.name || "New Project"}</h1>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="rounded-full hover:bg-[#6344fd]/30 text-[#6344fd] transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
          className={`${!canUndo ? "text-gray-600" : "text-gray-400"} rounded-full hover:text-white hover:bg-[#6344fd]/30`}



          >
            <Undo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
          className={`${!canUndo ? "text-gray-600" : "text-gray-400"} rounded-full hover:text-white hover:bg-[#6344fd]/30`}



          >
            <Redo className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Preview */}
      {currentVideoFile ? (
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {isVideoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading video...</p>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="max-w-full max-h-full object-contain"
            controls={false}
            preload="metadata"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Only toggle if video is loaded
              if (videoRef.current && videoRef.current.src) {
                togglePlayback();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onLoadedMetadata={() => {
              console.log("Video metadata loaded in preview");
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                setVideoElement(videoRef.current);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onPlay={() => {
              // Update state when video starts playing
              if (!isPlaying) {
                togglePlayback();
              }
            }}
            onPause={() => {
              // Update state when video pauses
              if (isPlaying) {
                togglePlayback();
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
          
          {/* Text Overlays */}
          {textOverlays.map(overlay => (
            isOverlayVisible(overlay) && (
              <div
                key={overlay.id}
                className="absolute pointer-events-none select-none"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${overlay.fontSize}px`,
                  fontFamily: overlay.fontFamily,
                  color: overlay.color,
                  backgroundColor: overlay.backgroundColor,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  opacity: overlay.backgroundOpacity,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}
              >
                {overlay.text}
              </div>
            )
          ))}
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && !isVideoLoading && (
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
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
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
        <Timeline
          project={project || { 
            id: "new-project", 
            name: "New Project", 
            duration, 
            resolution: "1080p", 
            aspectRatio: "16:9", 
            thumbnail: null, 
            videoClips: [], 
            audioTracks: [], 
            effects: [], 
            editHistory: [], 
            currentHistoryIndex: -1, 
            isExporting: false, 
            createdAt: new Date(), 
            updatedAt: new Date() 
          }}
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
        />
      )}

      {/* Speed Control (Active Tool) */}
      {activeTool === "speed" && (
        <div className="px-4 py-4 bg-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Speed</span>
            <div className="hover:bg-primary/90 bg-[#6344fd] text-white px-3 py-1 rounded-full">
              <span className="text-sm font-medium">{speed.toFixed(1)}x</span>
            </div>
          </div>
          <div className="relative ">
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

      {/* Text Overlays List */}
      {activeTool === "text" && textOverlays.length > 0 && (
        <div className="px-4 py-3 bg-gray-700">
          <h3 className="text-sm font-medium mb-3">Text Overlays</h3>
          <div className="space-y-2">
            {textOverlays.map(overlay => (
              <div key={overlay.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{overlay.text}</div>
                  <div className="text-xs text-gray-400">
                    {formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editOverlay(overlay)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteOverlay(overlay.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transitions List */}
      {activeTool === "transitions" && transitions.length > 0 && (
        <div className="px-4 py-3 bg-gray-700">
          <h3 className="text-sm font-medium mb-3">Transitions</h3>
          <div className="space-y-2">
            {transitions.map(transition => (
              <div key={transition.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{transition.type}</div>
                  <div className="text-xs text-gray-400">
                    {formatTime(transition.startTime)} - {formatTime(transition.startTime + transition.duration)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editTransition(transition)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTransition(transition.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
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

      {showTextOverlay && videoElement && (
        <TextOverlay
          videoElement={videoElement}
          duration={duration}
          onSave={handleTextOverlay}
          onCancel={() => {
            setShowTextOverlay(false);
            setSelectedOverlay(null);
          }}
          existingOverlay={selectedOverlay}
        />
      )}

      {showTransitions && (
        <Transitions
          duration={duration}
          onSave={handleTransition}
          onCancel={() => {
            setShowTransitions(false);
            setSelectedTransition(null);
          }}
          existingTransition={selectedTransition}
        />
      )}

      {/* Hidden video element for processing - always available */}
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
            className="hover:bg-primary/90 bg-[#6344fd] text-white"
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