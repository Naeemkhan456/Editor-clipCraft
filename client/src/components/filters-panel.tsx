import { useState } from "react";
import { Palette, Sliders, Sparkles, Camera, Sun, Moon, Droplets, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { predefinedFilters, lutFilters, type FilterOptions } from "@/lib/filters";

interface FiltersPanelProps {
  currentFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

export default function FiltersPanel({ currentFilters, onFiltersChange, onClose }: FiltersPanelProps) {
  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [customFilters, setCustomFilters] = useState<FilterOptions>(currentFilters);
  const [activeTab, setActiveTab] = useState<'presets' | 'basic' | 'advanced' | 'color' | 'lut'>('presets');

  const filterPresets = [
    { id: "none", name: "Original", preview: "🎬" },
    { id: "vintage", name: "Vintage", preview: "📸" },
    { id: "blackAndWhite", name: "B&W", preview: "⚫" },
    { id: "vibrant", name: "Vibrant", preview: "🌈" },
    { id: "cool", name: "Cool", preview: "❄️" },
    { id: "warm", name: "Warm", preview: "🔥" },
    { id: "dramatic", name: "Dramatic", preview: "⚡" },
    { id: "cinematic", name: "Cinematic", preview: "🎭" },
    { id: "portrait", name: "Portrait", preview: "👤" },
    { id: "landscape", name: "Landscape", preview: "🏔️" },
    { id: "retro", name: "Retro", preview: "📺" },
    { id: "modern", name: "Modern", preview: "💎" },
  ];

  const applyPreset = (presetId: string) => {
    setActiveFilter(presetId);
    const preset = predefinedFilters[presetId as keyof typeof predefinedFilters] || {};
    setCustomFilters(preset);
    onFiltersChange(preset);
  };

  const updateCustomFilter = (key: keyof FilterOptions, value: number | boolean | string) => {
    const updated = { ...customFilters, [key]: value };
    setCustomFilters(updated);
    onFiltersChange(updated);
    setActiveFilter("custom");
  };

  const renderSlider = (
    key: keyof FilterOptions,
    label: string,
    min: number,
    max: number,
    step: number = 1,
    unit: string = "",
    defaultValue: number = 0
  ) => (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        <span className="text-sm text-[#6344fd]">
          {customFilters[key] !== undefined ? customFilters[key] : defaultValue}
          <span className="text-gray-400">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={customFilters[key] !== undefined ? Number(customFilters[key]) : defaultValue}
        onChange={(e) => updateCustomFilter(key, parseFloat(e.target.value))}
        className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );

  const renderColorPicker = (key: keyof FilterOptions, label: string) => (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <input
        type="color"
        value={customFilters[key] as string || '#000000'}
        onChange={(e) => updateCustomFilter(key, e.target.value)}
        className="w-full h-10 rounded-lg border border-gray-600 cursor-pointer"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-secondary rounded-t-3xl w-full h-96 overflow-y-auto animate-slide-up">
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

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'presets', label: 'Presets', icon: Sparkles },
              { id: 'basic', label: 'Basic', icon: Sliders },
              { id: 'advanced', label: 'Advanced', icon: Zap },
              { id: 'color', label: 'Color', icon: Palette },
              { id: 'lut', label: 'LUTs', icon: Camera }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-[#6344fd] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Filter Presets Tab */}
          {activeTab === 'presets' && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-300">Quick Filters</h3>
              <div className="grid grid-cols-3 gap-3">
                {filterPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
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
          )}

          {/* Basic Filters Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Basic Adjustments</h3>
              {renderSlider('brightness', 'Brightness', 0, 200, 1, '%', 100)}
              {renderSlider('contrast', 'Contrast', 0, 200, 1, '%', 100)}
              {renderSlider('saturation', 'Saturation', 0, 200, 1, '%', 100)}
              {renderSlider('hue', 'Hue', -180, 180, 1, '°', 0)}
              {renderSlider('blur', 'Blur', 0, 10, 0.1, 'px', 0)}
              {renderSlider('sepia', 'Sepia', 0, 100, 1, '%', 0)}
            </div>
          )}

          {/* Advanced Filters Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Advanced Effects</h3>
              {renderSlider('gamma', 'Gamma', 0.1, 3, 0.1, '', 1)}
              {renderSlider('exposure', 'Exposure', -3, 3, 0.1, 'EV', 0)}
              {renderSlider('shadows', 'Shadows', -100, 100, 1, '%', 0)}
              {renderSlider('highlights', 'Highlights', -100, 100, 1, '%', 0)}
              {renderSlider('clarity', 'Clarity', -100, 100, 1, '%', 0)}
              {renderSlider('vibrance', 'Vibrance', -100, 100, 1, '%', 0)}
              {renderSlider('grain', 'Film Grain', 0, 100, 1, '%', 0)}
              {renderSlider('vignette', 'Vignette', 0, 100, 1, '%', 0)}
            </div>
          )}

          {/* Color Grading Tab */}
          {activeTab === 'color' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Color Grading</h3>
              {renderSlider('temperature', 'Temperature', -100, 100, 1, 'K', 0)}
              {renderSlider('tint', 'Tint', -100, 100, 1, '', 0)}
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Color Grading</h4>
                {renderColorPicker('shadowsColor', 'Shadows Color')}
                {renderColorPicker('midtonesColor', 'Midtones Color')}
                {renderColorPicker('highlightsColor', 'Highlights Color')}
              </div>
            </div>
          )}

          {/* LUT Filters Tab */}
          {activeTab === 'lut' && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-300">Look-Up Tables</h3>
              <div className="space-y-3">
                {lutFilters.map((lut) => (
                  <button
                    key={lut.name}
                    onClick={() => {
                      updateCustomFilter('lut', lut.name);
                      updateCustomFilter('lutIntensity', lut.intensity);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      customFilters.lut === lut.name
                        ? 'bg-[#6344fd] text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{lut.name}</div>
                    <div className="text-sm opacity-80">{lut.description}</div>
                    <div className="text-xs opacity-60 mt-1">
                      Category: {lut.category} • Intensity: {lut.intensity}
                    </div>
                  </button>
                ))}
              </div>
              
              {customFilters.lut && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">LUT Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={customFilters.lutIntensity || 0.5}
                    onChange={(e) => updateCustomFilter('lutIntensity', parseFloat(e.target.value))}
                    className="slider w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Intensity: {(customFilters.lutIntensity || 0.5) * 100}%
                  </div>
                </div>
              )}
            </div>
          )}

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