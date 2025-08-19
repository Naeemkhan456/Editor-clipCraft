import { useState, useCallback } from "react";
import { Upload, Image, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onFileSelected: (file: File, type: "video" | "image" | "audio") => void;
  onClose: () => void;
}

export default function VideoUpload({ onFileSelected, onClose }: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
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
    const fileType = file.type.toLowerCase();
    
    if (fileType.startsWith('video/')) {
      onFileSelected(file, 'video');
    } else if (fileType.startsWith('image/')) {
      onFileSelected(file, 'image');
    } else if (fileType.startsWith('audio/')) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-3xl w-full max-w-md animate-slide-up">
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
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              isDragOver 
                ? "border-accent bg-accent bg-opacity-10" 
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 mb-2">Drag & drop your files here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
            
            <input
              type="file"
              accept="video/*,image/*,audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelection(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <label className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors">
              <Film className="w-6 h-6 mb-2 text-blue-400" />
              <span className="text-sm">Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelection(file);
                }}
                className="hidden"
              />
            </label>
            
            <label className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors">
              <Image className="w-6 h-6 mb-2 text-green-400" />
              <span className="text-sm">Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelection(file);
                }}
                className="hidden"
              />
            </label>
            
            <label className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors">
              <Music className="w-6 h-6 mb-2 text-purple-400" />
              <span className="text-sm">Audio</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelection(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full mt-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}