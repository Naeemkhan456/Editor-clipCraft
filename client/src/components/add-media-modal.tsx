import React, { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File, type: "video" | "image" | "audio") => void;
}

export default function AddMediaModal({ isOpen, onClose, onFileSelected }: AddMediaModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreview(url);
    }
  }, []);

  const handleFileUpload = useCallback(() => {
    if (selectedFile) {
      const type = selectedFile.type.startsWith('video/') ? 'video' : 
                   selectedFile.type.startsWith('image/') ? 'image' : 'audio';
      onFileSelected(selectedFile, type);
      onClose();
      toast({
        title: "File uploaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} file has been uploaded successfully.`,
      });
    }
  }, [onFileSelected, selectedFile, onClose, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-2">Drag & drop your files here</p>
            <input
              type="file"
              accept="video/*,image/*,audio/*"
              onChange={handleFileSelect}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              Browse Files
            </Button>
          </div>
          {selectedFile && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Selected file: {selectedFile.name}</p>
              <Button
                onClick={handleFileUpload}
                className="w-full"
              >
                Upload {selectedFile.type.startsWith('video/') ? 'Video' : 
                       selectedFile.type.startsWith('image/') ? 'Image' : 'Audio'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
