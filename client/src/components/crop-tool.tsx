import { useState, useRef, useEffect } from "react";
import { Crop, RotateCw, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropToolProps {
  videoElement?: HTMLVideoElement;
  imageElement?: HTMLImageElement;
  onCrop: (cropArea: CropArea) => void;
  onCancel: () => void;
}

export default function CropTool({ videoElement, imageElement, onCrop, onCancel }: CropToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 180 });

  const mediaElement = videoElement || imageElement;
  
  if (!mediaElement) return null;

  useEffect(() => {
    if (!mediaElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size based on container
    const containerWidth = 320;
    const aspectRatio = (mediaElement as any).videoHeight ? 
      (mediaElement as any).videoWidth / (mediaElement as any).videoHeight :
      (mediaElement as any).width / (mediaElement as any).height;
    
    const canvasHeight = containerWidth / aspectRatio;
    canvas.width = containerWidth;
    canvas.height = canvasHeight;
    setCanvasSize({ width: containerWidth, height: canvasHeight });

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
      
      // Draw crop overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear crop area
      const cropX = (cropArea.x / 100) * canvas.width;
      const cropY = (cropArea.y / 100) * canvas.height;
      const cropW = (cropArea.width / 100) * canvas.width;
      const cropH = (cropArea.height / 100) * canvas.height;
      
      ctx.clearRect(cropX, cropY, cropW, cropH);
      ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
      
      // Draw crop border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropX, cropY, cropW, cropH);
      
      // Draw corner handles
      ctx.fillStyle = '#3b82f6';
      ctx.setLineDash([]);
      const handleSize = 8;
      const handles = [
        [cropX - handleSize/2, cropY - handleSize/2],
        [cropX + cropW - handleSize/2, cropY - handleSize/2],
        [cropX - handleSize/2, cropY + cropH - handleSize/2],
        [cropX + cropW - handleSize/2, cropY + cropH - handleSize/2],
      ];
      
      handles.forEach(([hx, hy]) => {
        ctx.fillRect(hx, hy, handleSize, handleSize);
      });
    };

    drawFrame();
    
    if (videoElement) {
      videoElement.addEventListener('timeupdate', drawFrame);
      return () => videoElement.removeEventListener('timeupdate', drawFrame);
    }
  }, [mediaElement, cropArea]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    setCropArea(prev => ({
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
      width: prev.width,
      height: prev.height,
    }));
    
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const presetRatios = [
    { name: "16:9", ratio: 16/9, icon: "📺" },
    { name: "9:16", ratio: 9/16, icon: "📱" },
    { name: "1:1", ratio: 1, icon: "⬜" },
    { name: "4:3", ratio: 4/3, icon: "🖥️" },
  ];

  const applyPresetRatio = (ratio: number) => {
    const canvasAspect = canvasSize.width / canvasSize.height;
    
    if (ratio > canvasAspect) {
      // Width limited
      const width = 80;
      const height = (width / ratio) * (canvasSize.width / canvasSize.height);
      setCropArea({
        x: 10,
        y: (100 - height) / 2,
        width,
        height,
      });
    } else {
      // Height limited
      const height = 80;
      const width = height * ratio * (canvasSize.height / canvasSize.width);
      setCropArea({
        x: (100 - width) / 2,
        y: 10,
        width,
        height,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-3xl w-full max-w-md animate-slide-up">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Crop & Resize</h2>
            <p className="text-gray-400">Drag to adjust crop area</p>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full rounded-2xl cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Aspect Ratio Presets */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {presetRatios.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPresetRatio(preset.ratio)}
                className="flex flex-col items-center p-3 rounded-xl bg-gray-800 hover:bg-accent transition-colors"
              >
                <span className="text-lg mb-1">{preset.icon}</span>
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Manual Controls */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Width</label>
              <input
                type="range"
                min="10"
                max="90"
                value={cropArea.width}
                onChange={(e) => setCropArea(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Height</label>
              <input
                type="range"
                min="10"
                max="90"
                value={cropArea.height}
                onChange={(e) => setCropArea(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              onClick={onCancel}
              variant="ghost"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onCrop(cropArea)}
              className="flex-1 bg-accent hover:bg-blue-600"
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}