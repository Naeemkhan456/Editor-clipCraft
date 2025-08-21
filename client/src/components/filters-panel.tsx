import { useState } from "react";
import { Palette, Sliders, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { predefinedFilters, type FilterOptions } from "@/lib/filters";

interface FiltersPanelProps {
  currentFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

export default function FiltersPanel({ currentFilters, onFiltersChange, onClose }: FiltersPanelProps) {
  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [customFilters, setCustomFilters] = useState<FilterOptions>(currentFilters);

  const filterPresets = [
    { id: "none", name: "Original", preview: "🎬" },
    { id: "vintage", name: "Vintage", preview: "📸" },
    { id: "blackAndWhite", name: "B&W", preview: "⚫" },
    { id: "vibrant", name: "Vibrant", preview: "🌈" },
    { id: "cool", name: "Cool", preview: "❄️" },
    { id: "warm", name: "Warm", preview: "🔥" },
    { id: "dramatic", name: "Dramatic", preview: "⚡" },
  ];

  const applyPreset = (presetId: string) => {
    setActiveFilter(presetId);
    const preset = predefinedFilters[presetId as keyof typeof predefinedFilters] || {};
    setCustomFilters(preset);
    onFiltersChange(preset);
  };

  const updateCustomFilter = (key: keyof FilterOptions, value: number | boolean) => {
    const updated = { ...customFilters, [key]: value };
    setCustomFilters(updated);
    onFiltersChange(updated);
    setActiveFilter("custom");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-secondary rounded-t-3xl w-full max-h-96 overflow-y-auto animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Filters & Effects</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#6344fd]/30 text-[#6344fd] transition-all duration-200"
            >
              ✕
            </Button>
          </div>

          {/* Filter Presets */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">Quick Filters</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {filterPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-colors ${
                    activeFilter === preset.id
                    ? "bg-[#6344fd] text-white hover:bg-primary/90"
                         : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <span className="text-2xl mb-1">{preset.preview}</span>
                  <span className="text-xs">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Adjustments */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Manual Adjustments</h3>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Brightness</label>
                <span className="text-sm text-[#6344fd]">{customFilters.brightness || 100} <span className="text-gray-400">%</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={customFilters.brightness || 100}
                onChange={(e) => updateCustomFilter('brightness', parseInt(e.target.value))}
                className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Contrast</label>
                <span className="text-sm text-[#6344fd]">{customFilters.contrast || 100}<span className="text-gray-400">%</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={customFilters.contrast || 100}
                onChange={(e) => updateCustomFilter('contrast', parseInt(e.target.value))}
                className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Saturation</label>
                <span className="text-sm text-[#6344fd]">{customFilters.saturation || 100}<span className="text-gray-400">%</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={customFilters.saturation || 100}
                onChange={(e) => updateCustomFilter('saturation', parseInt(e.target.value))}
                className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Hue</label>
                <span className="text-sm text-[#6344fd]">{customFilters.hue || 0} <span className="text-gray-400">°</span></span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={customFilters.hue || 0}
                onChange={(e) => updateCustomFilter('hue', parseInt(e.target.value))}
                className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Blur</label>
                <span className="text-sm text-[#6344fd]">{customFilters.blur || 0}<span className="text-gray-400">px</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={customFilters.blur || 0}
                onChange={(e) => updateCustomFilter('blur', parseFloat(e.target.value))}
                className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Sepia</label>
                <span className="text-sm text-[#6344fd]">{customFilters.sepia || 0}<span className="text-gray-400">%</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={customFilters.sepia || 0}
                onChange={(e) => updateCustomFilter('sepia', parseInt(e.target.value))}
                className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={() => applyPreset("none")}
            variant="outline"
            className="w-full mt-6 w-full bg-[#7c5cfa] hover:bg-[#6b4df5] text-white py-4 rounded-2xl font-semibold text-lg"
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}