import { useState, useCallback, useRef } from "react";
import { Upload, Image, Film, Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onFileSelected: (file: File, type: "video" | "image" | "audio") => void;
  onClose: () => void;
}

export default function VideoUpload({ onFileSelected, onClose }: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryType, setGalleryType] = useState<"video" | "image" | "audio">("video");
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    console.log("File selected for upload:", file.name, "Type:", file.type, "Size:", file.size);
    
    const fileType = file.type.toLowerCase();
    
    // Check file size (max 500MB for videos, 100MB for images/audio)
    const maxSize = fileType.startsWith('video/') ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize / (1024 * 1024)}MB.`,
        variant: "destructive",
      });
      return;
    }
    
    if (fileType.startsWith('video/')) {
      // Validate video formats
      const supportedVideoFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'];
      if (!supportedVideoFormats.includes(fileType)) {
        toast({
          title: "Unsupported video format",
          description: "Please select MP4, WebM, OGG, AVI, MOV, or WMV files.",
          variant: "destructive",
        });
        return;
      }
      onFileSelected(file, 'video');
    } else if (fileType.startsWith('image/')) {
      // Validate image formats
      const supportedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedImageFormats.includes(fileType)) {
        toast({
          title: "Unsupported image format",
          description: "Please select JPEG, PNG, GIF, or WebP files.",
          variant: "destructive",
        });
        return;
      }
      onFileSelected(file, 'image');
    } else if (fileType.startsWith('audio/')) {
      // Validate audio formats
      const supportedAudioFormats = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'];
      if (!supportedAudioFormats.includes(fileType)) {
        toast({
          title: "Unsupported audio format",
          description: "Please select MP3, WAV, OGG, AAC, or M4A files.",
          variant: "destructive",
        });
        return;
      }
      onFileSelected(file, 'audio');
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please select a video, image, or audio file.",
        variant: "destructive",
      });
      return;
    }
    
    onClose();
  };

  const openGallery = (type: "video" | "image" | "audio") => {
    setGalleryType(type);
    setShowGallery(true);
  };

  const handleGallerySelect = (file: File) => {
    const fileType = file.type.toLowerCase();
    let mediaType: "video" | "image" | "audio" = "video";
    
    if (fileType.startsWith('image/')) {
      mediaType = "image";
    } else if (fileType.startsWith('audio/')) {
      mediaType = "audio";
    }
    
    onFileSelected(file, mediaType);
    setShowGallery(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGalleryBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowGallery(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
        <div className="bg-secondary rounded-3xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Add Media</h2>
              <p className="text-gray-400">Upload video, image, or audio files</p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*,image/*,audio/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileSelection(file);
                };
                input.click();
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? "border-accent bg-accent bg-opacity-10" 
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">Drag & drop your files here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => openGallery("video")}
              >
                <Film className="w-6 h-6 mb-2 text-[#6344fd]" />
                <span className="text-sm">Video Gallery</span>
              </button>
              
              <button
                className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => openGallery("image")}
              >
                <Image className="w-6 h-6 mb-2 text-[#6344fd]" />
                <span className="text-sm">Image Gallery</span>
              </button>
              
              <button
                className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => openGallery("audio")}
              >
                <Music className="w-6 h-6 mb-2 text-[#6344fd]" />
                <span className="text-sm">Audio Gallery</span>
              </button>
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full mt-6 bg-[#6344fd]/20 hover:bg-[#6344fd]/30 text-[#6344fd] border border-[#6344fd]/30"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]" onClick={handleGalleryBackdropClick}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{galleryType} Gallery</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowGallery(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Click to browse {galleryType} files</p>
                <Button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = galleryType === "video" ? "video/*" : 
                                  galleryType === "image" ? "image/*" : 
                                  "audio/*,video/*";
                    input.multiple = true;
                    input.onchange = (e) => {
                      const fileList = (e.target as HTMLInputElement).files;
                      if (fileList) {
                        const files = Array.from(fileList);
                        const filteredFiles = files.filter(file => {
                          const fileType = file.type.toLowerCase();
                          if (galleryType === "video") return fileType.startsWith('video/');
                          if (galleryType === "image") return fileType.startsWith('image/');
                          if (galleryType === "audio") return fileType.startsWith('audio/') || fileType.startsWith('video/');
                          return false;
                        });
                        
                        if (filteredFiles.length > 0) {
                          handleGallerySelect(filteredFiles[0]);
                        }
                      }
                    };
                    input.click();
                  }}
                  className="bg-[#6344fd] hover:bg-[#6344fd]/90"
                >
                  Browse {galleryType} Files
                </Button>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowGallery(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
