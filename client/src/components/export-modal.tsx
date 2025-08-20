import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project} from "@shared/schema";

interface ExportModalProps {
  show: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings) => Promise<void>;
  project?: Project;
}

interface ExportSettings {
  resolution: string;
  aspectRatio: string;
  quality: string;
}

export default function ExportModal({ show, onClose, onExport, project }: ExportModalProps) {
  const [selectedResolution, setSelectedResolution] = useState("1080p");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");

  if (!show) return null;

  const resolutions = [
    { id: "1080p", label: "1080p HD", subtitle: "1920 × 1080" },
    { id: "720p", label: "720p", subtitle: "1280 × 720" },
    { id: "4K", label: "4K Ultra", subtitle: "3840 × 2160" },
    { id: "480p", label: "480p", subtitle: "854 × 480" },
  ];

  const aspectRatios = [
    { id: "16:9", label: "16:9", subtitle: "YouTube" },
    { id: "9:16", label: "9:16", subtitle: "TikTok" },
    { id: "1:1", label: "1:1", subtitle: "Instagram" },
  ];

  const handleExport = async () => {
    await onExport({
      resolution: selectedResolution,
      aspectRatio: selectedAspectRatio,
      quality: "high",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-secondary rounded-t-3xl w-full max-h-96 overflow-y-auto animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Export Video</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Resolution Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Resolution</h3>
            <div className="grid grid-cols-2 gap-3">
              {resolutions.map((resolution) => (
                <button
                  key={resolution.id}
                  onClick={() => setSelectedResolution(resolution.id)}
                  className={`export-option ${
                    selectedResolution === resolution.id
                      ? "bg-accent text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="font-semibold">{resolution.label}</div>
                  <div className="text-sm opacity-80">{resolution.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Aspect Ratio</h3>
            <div className="flex space-x-3">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedAspectRatio(ratio.id)}
                  className={`flex-1 export-option ${
                    selectedAspectRatio === ratio.id
                      ? "bg-accent text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="font-semibold">{ratio.label}</div>
                  <div className="text-sm opacity-80">{ratio.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
            <Button
              onClick={handleExport}
              className="w-full bg-success hover:bg-green-600 py-4 rounded-2xl font-semibold text-lg"
            >
              Start Export
            </Button>
        </div>
      </div>
    </div>
  );
}
