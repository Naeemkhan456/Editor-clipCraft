import { useState } from "react";
import { Zap, Clock, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TransitionData {
  id: string;
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe' | 'push' | 'crossfade';
  duration: number;
  startTime: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  intensity?: number;
}

interface TransitionsProps {
  duration: number;
  onSave: (transition: TransitionData) => void;
  onCancel: () => void;
  existingTransition?: TransitionData | null;
}

const transitionTypes = [
  { 
    id: 'fade', 
    name: 'Fade', 
    preview: '✨', 
    description: 'Smooth fade in/out',
    supportsDirection: false,
    supportsIntensity: true
  },
  { 
    id: 'slide', 
    name: 'Slide', 
    preview: '➡️', 
    description: 'Slide one clip over another',
    supportsDirection: true,
    supportsIntensity: false
  },
  { 
    id: 'zoom', 
    name: 'Zoom', 
    preview: '🔍', 
    description: 'Zoom in/out transition',
    supportsDirection: false,
    supportsIntensity: true
  },
  { 
    id: 'dissolve', 
    name: 'Dissolve', 
    preview: '💫', 
    description: 'Random pixel dissolve',
    supportsDirection: false,
    supportsIntensity: true
  },
  { 
    id: 'wipe', 
    name: 'Wipe', 
    preview: '🧹', 
    description: 'Wipe across the screen',
    supportsDirection: true,
    supportsIntensity: false
  },
  { 
    id: 'push', 
    name: 'Push', 
    preview: '📤', 
    description: 'Push one clip out',
    supportsDirection: true,
    supportsIntensity: false
  },
  { 
    id: 'crossfade', 
    name: 'Crossfade', 
    preview: '🔄', 
    description: 'Crossfade between clips',
    supportsDirection: false,
    supportsIntensity: true
  }
];

const directions = [
  { id: 'left', name: 'Left', icon: '⬅️' },
  { id: 'right', name: 'Right', icon: '➡️' },
  { id: 'up', name: 'Up', icon: '⬆️' },
  { id: 'down', name: 'Down', icon: '⬇️' }
];

const easingTypes = [
  { id: 'linear', name: 'Linear', description: 'Constant speed' },
  { id: 'ease-in', name: 'Ease In', description: 'Start slow, end fast' },
  { id: 'ease-out', name: 'Ease Out', description: 'Start fast, end slow' },
  { id: 'ease-in-out', name: 'Ease In/Out', description: 'Smooth acceleration' }
];

export default function Transitions({ 
  duration, 
  onSave, 
  onCancel, 
  existingTransition 
}: TransitionsProps) {
  const [transition, setTransition] = useState<TransitionData>(existingTransition || {
    id: Date.now().toString(),
    type: 'fade',
    duration: 1,
    startTime: Math.max(0, duration - 2),
    direction: 'left',
    easing: 'ease-in-out',
    intensity: 0.5
  });

  const [previewPlaying, setPreviewPlaying] = useState(false);

  const handleSave = () => {
    onSave(transition);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTransition = () => {
    return transitionTypes.find(t => t.id === transition.type);
  };

  const currentTransition = getCurrentTransition();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add Transition</h2>
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
              <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                {/* Transition Preview */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">
                      {currentTransition?.preview}
                    </div>
                    <div className="text-lg font-medium mb-2">
                      {currentTransition?.name} Transition
                    </div>
                    <div className="text-sm text-gray-400">
                      {currentTransition?.description}
                    </div>
                  </div>
                </div>

                {/* Transition Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      onClick={() => setPreviewPlaying(!previewPlaying)}
                      variant="ghost"
                      size="icon"
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      {previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center">
                Transition: {transition.type} • Duration: {transition.duration}s
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Transition Type */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Transition Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {transitionTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setTransition(prev => ({ ...prev, type: type.id as any }))}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        transition.type === type.id
                          ? 'bg-[#6344fd] text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.preview}</div>
                      <div className="text-sm font-medium">{type.name}</div>
                      <div className="text-xs opacity-80">{type.description}</div>
                    </button>
                  ))}
                </div>
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
                    value={transition.startTime}
                    onChange={(e) => setTransition(prev => ({ 
                      ...prev, 
                      startTime: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(transition.startTime)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Duration</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={transition.duration}
                    onChange={(e) => setTransition(prev => ({ 
                      ...prev, 
                      duration: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {transition.duration}s
                  </div>
                </div>
              </div>

              {/* Direction (for supported transitions) */}
              {currentTransition?.supportsDirection && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">Direction</label>
                  <div className="grid grid-cols-4 gap-2">
                    {directions.map(dir => (
                      <button
                        key={dir.id}
                        onClick={() => setTransition(prev => ({ ...prev, direction: dir.id as any }))}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          transition.direction === dir.id
                            ? 'bg-[#6344fd] text-white'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-xl mb-1">{dir.icon}</div>
                        <div className="text-xs">{dir.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Easing */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Easing</label>
                <div className="grid grid-cols-2 gap-2">
                  {easingTypes.map(ease => (
                    <button
                      key={ease.id}
                      onClick={() => setTransition(prev => ({ ...prev, easing: ease.id as any }))}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        transition.easing === ease.id
                          ? 'bg-[#6344fd] text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{ease.name}</div>
                      <div className="text-xs opacity-80">{ease.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity (for supported transitions) */}
              {currentTransition?.supportsIntensity && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Intensity: {(transition.intensity || 0.5) * 100}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={transition.intensity || 0.5}
                    onChange={(e) => setTransition(prev => ({ 
                      ...prev, 
                      intensity: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Low ← → High
                  </div>
                </div>
              )}

              {/* Transition Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Transition Info</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>Type: <span className="text-white">{currentTransition?.name}</span></div>
                  <div>Start: <span className="text-white">{formatTime(transition.startTime)}</span></div>
                  <div>Duration: <span className="text-white">{transition.duration}s</span></div>
                  {transition.direction && (
                    <div>Direction: <span className="text-white">{transition.direction}</span></div>
                  )}
                  <div>Easing: <span className="text-white">{transition.easing}</span></div>
                  {transition.intensity && (
                    <div>Intensity: <span className="text-white">{(transition.intensity * 100).toFixed(0)}%</span></div>
                  )}
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
              Add Transition
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 