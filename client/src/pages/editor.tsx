import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Undo, Redo, Play, Pause, SkipBack, SkipForward, Plus, Trash2, Upload, Scissors, Crop, Palette, Type, Music, Settings, LayoutTemplate, User, Zap, Download, Save, Share, X } from "lucide-react";

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
import { videoProcessor } from "@/lib/video-processor-fixed";
import BodyTools from "@/components/body-tools";
import { predefinedFilters, type FilterOptions } from "@/lib/filters";
import type { Project } from "@shared/schema";

type ProcessingProgress = {
  percentage: number;
  stage?: string;
};

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
  const [showBodyTools, setShowBodyTools] = useState(false);
  
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

  const tools = [
    { id: "trim", icon: Scissors, label: "Trim", action: () => setShowTrimTool(true) },
    { id: "speed", icon: SkipForward, label: "Speed", action: () => setActiveTool("speed") },
    { id: "crop", icon: Crop, label: "Crop", action: () => setShowCropTool(true) },
    { id: "filters", icon: Palette, label: "Filters", action: () => setShowFiltersPanel(true) },
    { id: "text", icon: Type, label: "Text", action: () => setShowTextOverlay(true) },
    { id: "transitions", icon: Zap, label: "Transitions", action: () => setShowTransitions(true) },
    { id: "body", icon: User, label: "Body", action: () => setShowBodyTools(true) },
    { id: "audio", icon: Music, label: "Audio", action: () => setActiveTool("audio") },
    { id: "test", icon: Zap, label: "Test FFmpeg", action: () => testFFmpegBasic() },
  ];

  // Add a simple FFmpeg test function
  const testFFmpegBasic = async () => {
    try {
      console.log("Testing basic FFmpeg functionality...");
      await videoProcessor.initialize();
      console.log("✅ FFmpeg initialized successfully!");
      
      // Test basic file operations
      const testData = new Uint8Array([0, 1, 2, 3, 4, 5]);
      await videoProcessor.ffmpeg?.writeFile('test.txt', testData);
      console.log("✅ File write test passed!");
      
      const readData = await videoProcessor.ffmpeg?.readFile('test.txt');
      console.log("✅ File read test passed!", readData);
      
      await videoProcessor.ffmpeg?.deleteFile('test.txt');
      console.log("✅ File delete test passed!");
      
      toast({
        title: "✅ FFmpeg Test Passed",
        description: "All basic FFmpeg operations are working correctly!",
      });
    } catch (error) {
      console.error("❌ FFmpeg test failed:", error);
      toast({
        title: "❌ FFmpeg Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

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
      
      const url = URL.createObjectURL(trimmedBlob);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
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
      const momentumDistance = velocity * 300;
      
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

const processVideoForExport = async (settings: any): Promise<Blob> => {
  setIsProcessing(true);
  setProcessingProgress(0);
  setProcessingStatus("Initializing FFmpeg...");

  try {
    if (!currentVideoFile) throw new Error("No video loaded to export");

    setProcessingStatus("Initializing video processor...");
    console.log("Current video file:", currentVideoFile.name, "Size:", currentVideoFile.size);

    // Initialize FFmpeg with improved error handling
    await videoProcessor.initialize();

    // Prepare filters array for videoProcessor
    setProcessingStatus("Preparing filters...");
    const filters: string[] = [];
    
    if (currentFilters.brightness !== undefined && currentFilters.brightness !== 50) {
      const brightnessValue = (currentFilters.brightness - 50) / 25;
      filters.push(`eq=brightness=${brightnessValue}`);
    }
    
    if (currentFilters.contrast !== undefined && currentFilters.contrast !== 50) {
      const contrastValue = (currentFilters.contrast - 50) / 25;
      filters.push(`eq=contrast=${contrastValue}`);
    }
    
    if (currentFilters.saturation !== undefined && currentFilters.saturation !== 100) {
      const saturationValue = currentFilters.saturation / 100;
      filters.push(`eq=saturation=${saturationValue}`);
    }
    
    if (currentFilters.hue !== undefined && currentFilters.hue !== 0) {
      const hueValue = currentFilters.hue * 3.6;
      filters.push(`hue=h=${hueValue}`);
    }
    
    if (currentFilters.blur !== undefined && currentFilters.blur > 0) {
      filters.push(`gblur=sigma=${currentFilters.blur / 10}`);
    }

    console.log("Prepared filters:", filters);

    // Filter transitions
    const filteredTransitions = transitions
      .filter(t => ['fade', 'slide', 'zoom', 'dissolve'].includes(t.type))
      .map(t => ({
        type: t.type as 'fade' | 'slide' | 'zoom' | 'dissolve',
        duration: t.duration,
        startTime: t.startTime
      }));

    console.log("Filtered transitions:", filteredTransitions);

    // Create progress update function
    const updateProgress = (progress: ProcessingProgress) => {
      setProcessingProgress(progress.percentage);
      setProcessingStatus(progress.stage || `Processing... ${Math.round(progress.percentage)}%`);
      
      // Simulate progress if it's stuck
      if (progress.percentage === 0) {
        setTimeout(() => {
          setProcessingProgress(prev => Math.min(prev + 5, 95));
        }, 1000);
      }
    };

    setProcessingStatus("Starting video processing...");
    console.log("Calling videoProcessor.processVideo...");

    const processedBlob = await videoProcessor.processVideo(
      {
        inputFile: currentVideoFile,
        outputFormat: "mp4",
        resolution: settings.resolution,
        aspectRatio: settings.aspectRatio,
        filters: filters.length > 0 ? filters : undefined,
        speed: speed,
        textOverlays: textOverlays.length > 0 ? textOverlays : undefined,
        audioTracks: currentAudioFile ? [{
          file: currentAudioFile,
          startTime: 0,
          volume: 1,
          fadeIn: 0.5,
          fadeOut: 0.5
        }] : undefined,
        transitions: filteredTransitions.length > 0 ? filteredTransitions : undefined,
      },
      updateProgress
    );

    console.log("Video processing completed. Blob size:", processedBlob.size);
    
    if (processedBlob.size === 0) {
      throw new Error("Processed video is empty - please try again");
    }

    setProcessingProgress(100);
    setProcessingStatus("Processing complete!");
    
    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsProcessing(false);
    
    toast({
      title: "✅ Export completed",
      description: "Your video has been processed successfully.",
    });

    return processedBlob;

  } catch (error) {
    console.error("Export error:", error);

    let errorMessage = "Failed to process video. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;

      // More specific error messages based on FFmpeg errors
      if (error.message.includes("FFmpeg") || error.message.includes("load")) {
        errorMessage = "Video processing engine failed to load. Please refresh the page and try again.";
      } else if (error.message.includes("failed to import ffmpeg-core.js")) {
        errorMessage = "FFmpeg core files could not be loaded. Please check your internet connection and try again.";
      } else if (error.message.includes("All FFmpeg loading methods failed")) {
        errorMessage = "FFmpeg initialization failed. Please refresh the page or try a different browser.";
      } else if (error.message.includes("empty")) {
        errorMessage = "The processed video is empty. Please try with different settings.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Video processing timed out. Please try with a shorter video or simpler settings.";
      }
    }

    setProcessingStatus("Processing failed");
    setProcessingProgress(0);

    // Delay before hiding to show error state
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);

    toast({
      title: "❌ Export failed",
      description: errorMessage,
      variant: "destructive",
    });

    throw error;
  }
};

// Add this function to test FFmpeg initialization
const testFFmpegInitialization = async (): Promise<boolean> => {
  try {
    console.log("🧪 Testing FFmpeg initialization...");
    
    // Check if videoProcessor has the initialize method
    if (typeof videoProcessor.initialize !== 'function') {
      console.error("❌ videoProcessor.initialize is not a function");
      return false;
    }
    
    // Try to initialize
    await videoProcessor.initialize();
    console.log("✅ FFmpeg initialized successfully");
    
    // Test with a simple operation
    if (currentVideoFile) {
      console.log("🧪 Testing simple trim operation...");
      const testBlob = await videoProcessor.trimVideo(currentVideoFile, 0, 2);
      console.log("✅ Trim test successful, blob size:", testBlob.size);
      
      if (testBlob.size === 0) {
        console.error("❌ Test blob is empty");
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("❌ FFmpeg test failed:", error);
    return false;
  }
};

  // NEW: Handle export choice (download, save, or share)
const handleExportChoice = async (settings: any, action: 'download' | 'save' | 'share') => {
  try {
    let processedBlob: Blob | null = null;
    let retryCount = 0;
    const maxRetries = 2;

    // Retry mechanism for export processing
    while (retryCount <= maxRetries) {
      try {
        processedBlob = await processVideoForExport(settings);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(`Export attempt ${retryCount} failed:`, error);

        if (retryCount <= maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));

          // Try to reinitialize FFmpeg for next attempt
          try {
            await videoProcessor.initialize();
            toast({
              title: "🔄 Retrying export",
              description: `Attempt ${retryCount + 1} of ${maxRetries + 1}...`,
            });
          } catch (initError) {
            console.error("FFmpeg reinitialization failed:", initError);
          }
        } else {
          // All retries failed
          let errorMessage = "Could not process the edited video.";
          let errorTitle = "❌ Export failed";

          if (error instanceof Error) {
            if (error.message.includes("FFmpeg") || error.message.includes("load")) {
              errorMessage = "Video processing engine failed to load. Please refresh the page and try again.";
              errorTitle = "⚠️ Processing Engine Error";
            } else if (error.message.includes("network") || error.message.includes("fetch")) {
              errorMessage = "Network error occurred. Please check your internet connection and try again.";
              errorTitle = "🌐 Network Error";
            } else if (error.message.includes("memory") || error.message.includes("out of memory")) {
              errorMessage = "Not enough memory to process this video. Try with a shorter video or lower resolution.";
              errorTitle = "💾 Memory Error";
            } else if (error.message.includes("timeout")) {
              errorMessage = "Video processing timed out. Please try with a shorter video.";
              errorTitle = "⏱️ Processing Timeout";
            }
          }

          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Only proceed if we have a valid processed blob
    if (!processedBlob || processedBlob.size === 0) {
      toast({
        title: "❌ Export failed",
        description: "The processed video is empty. Please try again with different settings.",
        variant: "destructive",
      });
      return;
    }

    // Handle different export actions
    if (action === 'download') {
      const exportedUrl = URL.createObjectURL(processedBlob);
      const a = document.createElement("a");
      a.href = exportedUrl;
      a.download = `edited-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(exportedUrl);
      }, 100);
      toast({
        title: "📥 Download started",
        description: "Your edited video is being downloaded.",
      });
    } else if (action === 'save') {
      await saveToDevice(processedBlob);
    } else if (action === 'share') {
      await shareVideo(processedBlob);
    }
  } catch (error) {
    console.error("Export choice error:", error);
    toast({
      title: "❌ Unexpected error",
      description: "An unexpected error occurred during export. Please try again.",
      variant: "destructive",
    });
  }
};

// Add this function to test if videoProcessor is working
const testVideoProcessor = async () => {
  try {
    console.log("Testing video processor initialization...");
    await videoProcessor.initialize();
    console.log("Video processor initialized successfully");

    // Test with a simple operation
    if (currentVideoFile) {
      console.log("Testing trim operation...");
      const testBlob = await videoProcessor.trimVideo(currentVideoFile, 0, 5);
      console.log("Test trim successful, blob size:", testBlob.size);

      if (testBlob.size === 0) {
        console.error("Test blob is empty - video processing may not be working correctly");
      }
    }
  } catch (error) {
    console.error("Video processor test failed:", error);

    let errorMessage = "Video processor test failed.";
    if (error instanceof Error) {
      errorMessage = error.message;

      // More specific error messages based on FFmpeg errors
      if (error.message.includes("FFmpeg") || error.message.includes("load")) {
        errorMessage = "Video processing engine failed to load during test.";
      } else if (error.message.includes("failed to import ffmpeg-core.js")) {
        errorMessage = "FFmpeg core files could not be loaded during test.";
      } else if (error.message.includes("All FFmpeg loading methods failed")) {
        errorMessage = "FFmpeg initialization failed during test.";
      } else if (error.message.includes("empty")) {
        errorMessage = "Test operation produced empty result.";
      }
    }

    console.error("Test error details:", errorMessage);
  }
};

// Call this in useEffect or when needed
useEffect(() => {
  if (currentVideoFile) {
    testVideoProcessor();
  }
}, [currentVideoFile]);

  // NEW: Save video to device
const saveToDevice = async (blob: Blob) => {
  try {
    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `video-${Date.now()}.mp4`,
        types: [{
          description: 'MP4 Video',
          accept: {'video/mp4': ['.mp4']},
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      toast({
        title: "💾 Video saved",
        description: "Video has been saved to your device.",
      });
    } else {
      // Fallback to download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📥 Download started",
        description: "Your video is being downloaded.",
      });
    }
  } catch (error) {
    console.error("Save error:", error);
    toast({
      title: "❌ Save failed",
      description: "Failed to save video.",
      variant: "destructive",
    });
  }
};

const shareVideo = async (blob: Blob) => {
  try {
    if (navigator.share) {
      const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Edited Video',
          text: 'Check out this video I edited!',
        });
        
        toast({
          title: "📤 Video shared",
          description: "Your video has been shared successfully.",
        });
      } else {
        toast({
          title: "❌ Sharing not supported",
          description: "Your device doesn't support sharing video files.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "❌ Sharing not supported",
        description: "Your browser doesn't support sharing.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Share error:", error);
    if (error instanceof Error && error.name !== 'AbortError') {
      toast({
        title: "❌ Share failed",
        description: "Failed to share video.",
        variant: "destructive",
      });
    }
  }
};

  // NEW: Share video


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
            playsInline
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
          <button
            onClick={togglePlayback}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
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

      {/* Updated Export Modal with options */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={processVideoForExport}
        currentVideoFile={currentVideoFile}
      />

      {/* Body Tools Modal */}
      {showBodyTools && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Body & Face Tools</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBodyTools(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <BodyTools
                currentVideoFile={currentVideoFile}
                onVideoProcessed={(processedBlob) => {
                  // Convert blob back to file for further processing
                  const processedFile = new File([processedBlob], 'processed-video.mp4', { type: 'video/mp4' });
                  setCurrentVideoFile(processedFile);
                  setShowBodyTools(false);
                  toast({
                    title: "✅ Video processed",
                    description: "Your video has been processed with the selected effects.",
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ProcessingModal 
        isOpen={isProcessing}
        progress={processingProgress}
        status={processingStatus}
      />
    </div>
  );
}