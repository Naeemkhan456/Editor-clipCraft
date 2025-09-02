import { useState, useRef } from "react";
import { Scissors, Crop, User, Eye, Ear, Sparkles, Download, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { videoProcessor } from "@/lib/video-processor-fixed";

interface BodyToolsProps {
  currentVideoFile: File | null;
  onVideoProcessed: (processedBlob: Blob) => void;
}

export default function BodyTools({ currentVideoFile, onVideoProcessed }: BodyToolsProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Split tool state
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [newSplitPoint, setNewSplitPoint] = useState("");
  
  // Crop tool state
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(1920);
  const [cropHeight, setCropHeight] = useState(1080);
  
  // Face effects state
  const [faceEffects, setFaceEffects] = useState({
    noseSize: 1.0,
    earSize: 1.0,
    eyeSize: 1.0,
    faceCleaner: false,
    skinSmoothing: 0.5
  });
  
  // Body effects state
  const [bodyEffects, setBodyEffects] = useState({
    bodyWhitening: 0.2,
    bodySmoothing: 0.3,
    bodyContrast: 1.1,
    bodyBrightness: 0.1
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const addSplitPoint = () => {
    const point = parseFloat(newSplitPoint);
    if (!isNaN(point) && point > 0 && !splitPoints.includes(point)) {
      setSplitPoints([...splitPoints, point].sort((a, b) => a - b));
      setNewSplitPoint("");
    }
  };

  const removeSplitPoint = (index: number) => {
    setSplitPoints(splitPoints.filter((_, i) => i !== index));
  };

  const handleSplitVideo = async () => {
    if (!currentVideoFile || splitPoints.length === 0) {
      toast({
        title: "❌ Invalid input",
        description: "Please select a video file and add split points.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const segments = await videoProcessor.splitVideo(currentVideoFile, splitPoints);
      
      if (segments.length > 0) {
        // For now, we'll use the first segment as the result
        // In a full implementation, you might want to show all segments
        onVideoProcessed(segments[0]);
        
        toast({
          title: "✅ Video split successfully",
          description: `Created ${segments.length} video segments.`,
        });
      }
    } catch (error) {
      console.error('Video splitting failed:', error);
      toast({
        title: "❌ Split failed",
        description: error instanceof Error ? error.message : "Failed to split video.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleCropVideo = async () => {
    if (!currentVideoFile) {
      toast({
        title: "❌ No video file",
        description: "Please select a video file to crop.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const croppedBlob = await videoProcessor.cropVideo(
        currentVideoFile,
        cropX,
        cropY,
        cropWidth,
        cropHeight
      );
      
      onVideoProcessed(croppedBlob);
      
      toast({
        title: "✅ Video cropped successfully",
        description: "Your video has been cropped.",
      });
    } catch (error) {
      console.error('Video cropping failed:', error);
      toast({
        title: "❌ Crop failed",
        description: error instanceof Error ? error.message : "Failed to crop video.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleFaceEffects = async () => {
    if (!currentVideoFile) {
      toast({
        title: "❌ No video file",
        description: "Please select a video file to apply face effects.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const processedBlob = await videoProcessor.applyFaceEffects(currentVideoFile, faceEffects);
      
      onVideoProcessed(processedBlob);
      
      toast({
        title: "✅ Face effects applied",
        description: "Face effects have been applied to your video.",
      });
    } catch (error) {
      console.error('Face effects failed:', error);
      toast({
        title: "❌ Face effects failed",
        description: error instanceof Error ? error.message : "Failed to apply face effects.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleBodyEffects = async () => {
    if (!currentVideoFile) {
      toast({
        title: "❌ No video file",
        description: "Please select a video file to apply body effects.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const processedBlob = await videoProcessor.applyBodyEffects(currentVideoFile, bodyEffects);
      
      onVideoProcessed(processedBlob);
      
      toast({
        title: "✅ Body effects applied",
        description: "Body effects have been applied to your video.",
      });
    } catch (error) {
      console.error('Body effects failed:', error);
      toast({
        title: "❌ Body effects failed",
        description: error instanceof Error ? error.message : "Failed to apply body effects.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const resetAllEffects = () => {
    setFaceEffects({
      noseSize: 1.0,
      earSize: 1.0,
      eyeSize: 1.0,
      faceCleaner: false,
      skinSmoothing: 0.5
    });
    
    setBodyEffects({
      bodyWhitening: 0.2,
      bodySmoothing: 0.3,
      bodyContrast: 1.1,
      bodyBrightness: 0.1
    });
    
    setSplitPoints([]);
    setCropX(0);
    setCropY(0);
    setCropWidth(1920);
    setCropHeight(1080);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Body & Face Tools</h2>
        </div>
        <Button
          variant="outline"
          onClick={resetAllEffects}
          disabled={isProcessing}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Tools Tabs */}
      <Tabs defaultValue="split" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="split" className="flex items-center space-x-2">
            <Scissors className="w-4 h-4" />
            <span>Split</span>
          </TabsTrigger>
          <TabsTrigger value="crop" className="flex items-center space-x-2">
            <Crop className="w-4 h-4" />
            <span>Crop</span>
          </TabsTrigger>
          <TabsTrigger value="face" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Face</span>
          </TabsTrigger>
          <TabsTrigger value="body" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Body</span>
          </TabsTrigger>
        </TabsList>

        {/* Split Tool */}
        <TabsContent value="split" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scissors className="w-5 h-5" />
                <span>Video Split Tool</span>
              </CardTitle>
              <CardDescription>
                Split your video into multiple segments at specific time points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Time in seconds (e.g., 30.5)"
                  value={newSplitPoint}
                  onChange={(e) => setNewSplitPoint(e.target.value)}
                  step="0.1"
                  min="0"
                />
                <Button onClick={addSplitPoint} disabled={!newSplitPoint}>
                  Add Point
                </Button>
              </div>

              {splitPoints.length > 0 && (
                <div className="space-y-2">
                  <Label>Split Points (seconds):</Label>
                  <div className="flex flex-wrap gap-2">
                    {splitPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-lg"
                      >
                        <span className="text-sm">{point}s</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSplitPoint(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSplitVideo}
                disabled={!currentVideoFile || splitPoints.length === 0 || isProcessing}
                className="w-full"
              >
                <Scissors className="w-4 h-4 mr-2" />
                Split Video
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crop Tool */}
        <TabsContent value="crop" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crop className="w-5 h-5" />
                <span>Video Crop Tool</span>
              </CardTitle>
              <CardDescription>
                Crop your video to focus on specific areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropX">X Position</Label>
                  <Input
                    id="cropX"
                    type="number"
                    value={cropX}
                    onChange={(e) => setCropX(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropY">Y Position</Label>
                  <Input
                    id="cropY"
                    type="number"
                    value={cropY}
                    onChange={(e) => setCropY(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropWidth">Width</Label>
                  <Input
                    id="cropWidth"
                    type="number"
                    value={cropWidth}
                    onChange={(e) => setCropWidth(parseInt(e.target.value) || 1920)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropHeight">Height</Label>
                  <Input
                    id="cropHeight"
                    type="number"
                    value={cropHeight}
                    onChange={(e) => setCropHeight(parseInt(e.target.value) || 1080)}
                    min="1"
                  />
                </div>
              </div>

              <Button
                onClick={handleCropVideo}
                disabled={!currentVideoFile || isProcessing}
                className="w-full"
              >
                <Crop className="w-4 h-4 mr-2" />
                Crop Video
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Face Effects Tool */}
        <TabsContent value="face" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Face Effects</span>
              </CardTitle>
              <CardDescription>
                Enhance and modify facial features in your video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Nose Size: {faceEffects.noseSize.toFixed(1)}x</span>
                  </Label>
                  <Slider
                    value={[faceEffects.noseSize]}
                    onValueChange={(value) => setFaceEffects(prev => ({ ...prev, noseSize: value[0] }))}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Ear className="w-4 h-4" />
                    <span>Ear Size: {faceEffects.earSize.toFixed(1)}x</span>
                  </Label>
                  <Slider
                    value={[faceEffects.earSize]}
                    onValueChange={(value) => setFaceEffects(prev => ({ ...prev, earSize: value[0] }))}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Eye Size: {faceEffects.eyeSize.toFixed(1)}x</span>
                  </Label>
                  <Slider
                    value={[faceEffects.eyeSize]}
                    onValueChange={(value) => setFaceEffects(prev => ({ ...prev, eyeSize: value[0] }))}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Skin Smoothing: {Math.round(faceEffects.skinSmoothing * 100)}%</span>
                  </Label>
                  <Slider
                    value={[faceEffects.skinSmoothing]}
                    onValueChange={(value) => setFaceEffects(prev => ({ ...prev, skinSmoothing: value[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="faceCleaner"
                    checked={faceEffects.faceCleaner}
                    onChange={(e) => setFaceEffects(prev => ({ ...prev, faceCleaner: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="faceCleaner">Face Cleaner (Remove blemishes)</Label>
                </div>
              </div>

              <Button
                onClick={handleFaceEffects}
                disabled={!currentVideoFile || isProcessing}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Face Effects
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Effects Tool */}
        <TabsContent value="body" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Body Effects</span>
              </CardTitle>
              <CardDescription>
                Enhance and modify body appearance in your video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Body Whitening: {Math.round(bodyEffects.bodyWhitening * 100)}%</span>
                  </Label>
                  <Slider
                    value={[bodyEffects.bodyWhitening]}
                    onValueChange={(value) => setBodyEffects(prev => ({ ...prev, bodyWhitening: value[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Body Smoothing: {Math.round(bodyEffects.bodySmoothing * 100)}%</span>
                  </Label>
                  <Slider
                    value={[bodyEffects.bodySmoothing]}
                    onValueChange={(value) => setBodyEffects(prev => ({ ...prev, bodySmoothing: value[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Body Contrast: {bodyEffects.bodyContrast.toFixed(1)}x</span>
                  </Label>
                  <Slider
                    value={[bodyEffects.bodyContrast]}
                    onValueChange={(value) => setBodyEffects(prev => ({ ...prev, bodyContrast: value[0] }))}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Body Brightness: {Math.round(bodyEffects.bodyBrightness * 100)}%</span>
                  </Label>
                  <Slider
                    value={[bodyEffects.bodyBrightness]}
                    onValueChange={(value) => setBodyEffects(prev => ({ ...prev, bodyBrightness: value[0] }))}
                    max={1}
                    min={-0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={handleBodyEffects}
                disabled={!currentVideoFile || isProcessing}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Body Effects
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <div className="font-medium text-blue-800">Processing...</div>
                <div className="text-sm text-blue-600">Please wait while we apply the effects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
