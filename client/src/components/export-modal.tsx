import { useState, useRef, useEffect } from "react";
import { X, Download, Video, Settings, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ProcessingProgress } from "@/lib/video-processor-fixed";

interface ExportModalProps {
  show: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<Blob>;
  currentVideoFile: File | null;
}

interface ExportOptions {
  format: string;
  quality: number;
  resolution: string;
  includeAudio: boolean;
  watermark: boolean;
  watermarkText: string;
}

export default function ExportModal({ show, onClose, onExport, currentVideoFile }: ExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ProcessingProgress>({
    percentage: 0,
    stage: "Ready to export"
  });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "mp4",
    quality: 85,
    resolution: "1080p",
    includeAudio: true,
    watermark: false,
    watermarkText: "Edited with ClipCraft"
  });

  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setIsExporting(false);
      setExportProgress({ percentage: 0, stage: "Ready to export" });
      setExportedBlob(null);
      setExportError(null);
    }
  }, [show]);

  // Auto-scroll progress bar
  useEffect(() => {
    if (progressRef.current && isExporting) {
      progressRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [exportProgress.percentage, isExporting]);

  const handleExport = async () => {
    if (!currentVideoFile) {
      toast({
        title: "❌ No video file",
        description: "Please select a video file to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress({ percentage: 0, stage: "Starting export..." });

    try {
      // Create a progress callback
      const onProgress = (progress: ProcessingProgress) => {
        setExportProgress(progress);
        console.log(`Export progress: ${progress.percentage}% - ${progress.stage}`);
      };

      // Call the export function with progress tracking
      const result = await onExport(exportOptions);
      
      setExportedBlob(result);
      setExportProgress({ percentage: 100, stage: "Export completed successfully!" });
      
      toast({
        title: "✅ Export successful",
        description: "Your video has been exported successfully!",
      });

    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setExportProgress({ percentage: 0, stage: "Export failed" });
      
      toast({
        title: "❌ Export failed",
        description: error instanceof Error ? error.message : "Failed to export video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExportedVideo = () => {
    if (exportedBlob) {
      const url = URL.createObjectURL(exportedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exported-video-${Date.now()}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📥 Download started",
        description: "Your video download has started.",
      });
    }
  };

  const resetExport = () => {
    setIsExporting(false);
    setExportProgress({ percentage: 0, stage: "Ready to export" });
    setExportedBlob(null);
    setExportError(null);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Export Video</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isExporting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isExporting && !exportedBlob && !exportError && (
            <>
              {/* Export Options */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Export Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure your export preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Format</Label>
                      <Select
                        value={exportOptions.format}
                        onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                          <SelectItem value="mov">MOV (ProRes)</SelectItem>
                          <SelectItem value="webm">WebM (VP9)</SelectItem>
                          <SelectItem value="gif">GIF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resolution">Resolution</Label>
                      <Select
                        value={exportOptions.resolution}
                        onValueChange={(value) => setExportOptions(prev => ({ ...prev, resolution: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="480p">480p (854x480)</SelectItem>
                          <SelectItem value="720p">720p (1280x720)</SelectItem>
                          <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                          <SelectItem value="2K">2K (2560x1440)</SelectItem>
                          <SelectItem value="4K">4K (3840x2160)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality: {exportOptions.quality}%</Label>
                    <Slider
                      value={[exportOptions.quality]}
                      onValueChange={(value) => setExportOptions(prev => ({ ...prev, quality: value[0] }))}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeAudio"
                        checked={exportOptions.includeAudio}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeAudio: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="includeAudio">Include Audio</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="watermark"
                        checked={exportOptions.watermark}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, watermark: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="watermark">Add Watermark</Label>
                    </div>
                  </div>

                  {exportOptions.watermark && (
                    <div className="space-y-2">
                      <Label htmlFor="watermarkText">Watermark Text</Label>
                      <Input
                        id="watermarkText"
                        value={exportOptions.watermarkText}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, watermarkText: e.target.value }))}
                        placeholder="Enter watermark text"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                className="w-full"
                size="lg"
                disabled={!currentVideoFile}
              >
                <Download className="w-4 h-4 mr-2" />
                Start Export
              </Button>
            </>
          )}

          {/* Progress Section */}
          {isExporting && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Exporting Video...</span>
                </CardTitle>
                <CardDescription>
                  Please wait while we process your video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={progressRef} className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${exportProgress.percentage}%` }}
                    />
                  </div>

                  {/* Progress Details */}
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {exportProgress.percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exportProgress.stage}
                    </div>
                    
                    {/* Time estimates */}
                    {exportProgress.currentTime && exportProgress.totalTime && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(exportProgress.currentTime / 1000)}s elapsed
                        {exportProgress.totalTime && ` • ~${Math.round(exportProgress.totalTime / 1000)}s total`}
                      </div>
                    )}
                  </div>

                  {/* Cancel Button */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={resetExport}
                      className="mt-4"
                    >
                      Cancel Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Section */}
          {exportedBlob && !isExporting && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span>Export Completed!</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  Your video has been processed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-green-700">
                    File size: {(exportedBlob.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <div className="text-sm text-green-700">
                    Format: {exportOptions.format.toUpperCase()}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={downloadExportedVideo}
                    className="flex-1"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetExport}
                    className="flex-1"
                  >
                    Export Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Section */}
          {exportError && !isExporting && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>Export Failed</span>
                </CardTitle>
                <CardDescription className="text-red-700">
                  There was an error processing your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-800">{exportError}</p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={resetExport}
                    className="flex-1"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}