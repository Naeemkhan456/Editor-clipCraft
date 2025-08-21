import { useState, useRef, useEffect } from "react";
import { Type, Move, Clock, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TextOverlayData {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'typewriter';
}

interface TextOverlayProps {
  videoElement: HTMLVideoElement;
  duration: number;
  onSave: (overlay: TextOverlayData) => void;
  onCancel: () => void;
  existingOverlay?: TextOverlayData | null;
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Lucida Console'
];

const animations = [
  { id: 'none', name: 'None', preview: '📝' },
  { id: 'fade', name: 'Fade', preview: '✨' },
  { id: 'slide', name: 'Slide', preview: '➡️' },
  { id: 'bounce', name: 'Bounce', preview: '🎾' },
  { id: 'typewriter', name: 'Typewriter', preview: '⌨️' }
];

export default function TextOverlay({ 
  videoElement, 
  duration, 
  onSave, 
  onCancel, 
  existingOverlay 
}: TextOverlayProps) {
  const [overlay, setOverlay] = useState<TextOverlayData>(existingOverlay || {
    id: Date.now().toString(),
    text: 'Sample Text',
    startTime: 0,
    endTime: Math.min(5, duration),
    x: 50,
    y: 50,
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Arial',
    backgroundColor: '#000000',
    backgroundOpacity: 0.5,
    animation: 'none'
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = useState({ x: overlay.x, y: overlay.y });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set video element ref when component mounts
  useEffect(() => {
    if (videoRef.current && videoElement) {
      videoRef.current.src = videoElement.src;
      videoRef.current.load();
    }
  }, [videoElement]);

  // Update preview position when overlay changes
  useEffect(() => {
    setPreviewPosition({ x: overlay.x, y: overlay.y });
  }, [overlay.x, overlay.y]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return;
    
    const rect = previewRef.current.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));
    
    setPreviewPosition({ x: clampedX, y: clampedY });
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setOverlay(prev => ({ ...prev, x: previewPosition.x, y: previewPosition.y }));
      setIsDragging(false);
    }
  };

  // Update overlay when dragging ends
  useEffect(() => {
    if (!isDragging && previewRef.current) {
      setOverlay(prev => ({ ...prev, x: previewPosition.x, y: previewPosition.y }));
    }
  }, [isDragging, previewPosition]);

  const handleSave = () => {
    onSave(overlay);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add Text Overlay</h2>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#6344fd]/30 text-[#6344fd]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Area */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Preview</h3>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  loop
                />
                
                {/* Text Overlay Preview */}
                <div
                  ref={previewRef}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${previewPosition.x}%`,
                    top: `${previewPosition.y}%`,
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
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {overlay.text}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                Drag the text to reposition • Current: {overlay.x.toFixed(1)}%, {overlay.y.toFixed(1)}%
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Text Input */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Text Content</label>
                <textarea
                  value={overlay.text}
                  onChange={(e) => setOverlay(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 text-white resize-none"
                  rows={3}
                  placeholder="Enter your text here..."
                />
              </div>

              {/* Timing Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Start Time</label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={overlay.startTime}
                    onChange={(e) => setOverlay(prev => ({ 
                      ...prev, 
                      startTime: parseFloat(e.target.value),
                      endTime: Math.max(parseFloat(e.target.value), prev.endTime)
                    }))}
                    className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(overlay.startTime)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">End Time</label>
                  <input
                    type="range"
                    min={overlay.startTime}
                    max={duration}
                    step="0.1"
                    value={overlay.endTime}
                    onChange={(e) => setOverlay(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(overlay.endTime)}
                  </div>
                </div>
              </div>

              {/* Font Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Font Family</label>
                  <select
                    value={overlay.fontFamily}
                    onChange={(e) => setOverlay(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 text-white"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Font Size</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="1"
                    value={overlay.fontSize}
                    onChange={(e) => setOverlay(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {overlay.fontSize}px
                  </div>
                </div>
              </div>

              {/* Color Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Text Color</label>
                  <input
                    type="color"
                    value={overlay.color}
                    onChange={(e) => setOverlay(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-gray-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Background Color</label>
                  <input
                    type="color"
                    value={overlay.backgroundColor || '#000000'}
                    onChange={(e) => setOverlay(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-gray-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Background Opacity */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Background Opacity: {(overlay.backgroundOpacity || 0.5) * 100}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={overlay.backgroundOpacity || 0.5}
                  onChange={(e) => setOverlay(prev => ({ ...prev, backgroundOpacity: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Animation */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Animation</label>
                <div className="grid grid-cols-5 gap-2">
                  {animations.map(anim => (
                    <button
                      key={anim.id}
                      onClick={() => setOverlay(prev => ({ ...prev, animation: anim.id as any }))}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        overlay.animation === anim.id
                          ? 'bg-[#6344fd] text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      title={anim.name}
                    >
                      <div className="text-lg mb-1">{anim.preview}</div>
                      <div className="text-xs">{anim.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 py-2 bg-[#6344fd] hover:bg-[#5a3fd8] text-white"
            >
              Add Text Overlay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 