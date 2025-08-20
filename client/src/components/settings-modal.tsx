import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SettingsState {
  // General Settings
  resolution: string;
  frameRate: number;
  aspectRatio: string;
  backgroundColor: string;
  fillMode: string;
  
  // Audio Settings
  masterVolume: number;
  trackVolume: number;
  voiceOverEnabled: boolean;
  audioQuality: string;
  noiseReduction: boolean;
  
  // Export Settings
  fileFormat: string;
  compressionLevel: string;
  bitrateControl: string;
  customBitrate: number;
  exportThumbnail: boolean;
  
  // Performance Settings
  gpuAcceleration: boolean;
  previewQuality: string;
  renderingPreference: string;
  
  // Editor Preferences
  theme: string;
  defaultTransitionDuration: number;
  defaultExportFolder: string;
  autoSaveInterval: number;
  
  // Advanced Settings
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkLogo: string;
  language: string;
  mobileMode: boolean;
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<SettingsState>({
    // General Settings
    resolution: "1080p",
    frameRate: 30,
    aspectRatio: "16:9",
    backgroundColor: "#000000",
    fillMode: "black-bars",
    
    // Audio Settings
    masterVolume: 100,
    trackVolume: 100,
    voiceOverEnabled: true,
    audioQuality: "320",
    noiseReduction: true,
    
    // Export Settings
    fileFormat: "mp4",
    compressionLevel: "balanced",
    bitrateControl: "auto",
    customBitrate: 5000,
    exportThumbnail: true,
    
    // Performance Settings
    gpuAcceleration: true,
    previewQuality: "high",
    renderingPreference: "quality",
    
    // Editor Preferences
    theme: "dark",
    defaultTransitionDuration: 1,
    defaultExportFolder: "/exports",
    autoSaveInterval: 5,
    
    // Advanced Settings
    watermarkEnabled: false,
    watermarkText: "Your Watermark",
    watermarkLogo: "",
    language: "en",
    mobileMode: false,
  });

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('videoEditorSettings', JSON.stringify(settings));
    onOpenChange(false);
  };

  const handleReset = () => {
    localStorage.removeItem('videoEditorSettings');
    // Reset to defaults
    setSettings({
      resolution: "1080p",
      frameRate: 30,
      aspectRatio: "16:9",
      backgroundColor: "#000000",
      fillMode: "black-bars",
      masterVolume: 100,
      trackVolume: 100,
      voiceOverEnabled: true,
      audioQuality: "320",
      noiseReduction: true,
      fileFormat: "mp4",
      compressionLevel: "balanced",
      bitrateControl: "auto",
      customBitrate: 5000,
      exportThumbnail: true,
      gpuAcceleration: true,
      previewQuality: "high",
      renderingPreference: "quality",
      theme: "dark",
      defaultTransitionDuration: 1,
      defaultExportFolder: "/exports",
      autoSaveInterval: 5,
      watermarkEnabled: false,
      watermarkText: "Your Watermark",
      watermarkLogo: "",
      language: "en",
      mobileMode: false,
    });
  };

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('videoEditorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Select value={settings.resolution} onValueChange={(value) => updateSetting('resolution', value)}>
                  <SelectTrigger id="resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480p (SD)</SelectItem>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="2k">2K (1440p)</SelectItem>
                    <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frameRate">Frame Rate (FPS)</Label>
                <Select value={settings.frameRate.toString()} onValueChange={(value) => updateSetting('frameRate', parseInt(value))}>
                  <SelectTrigger id="frameRate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                    <SelectItem value="120">120 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <Select value={settings.aspectRatio} onValueChange={(value) => updateSetting('aspectRatio', value)}>
                  <SelectTrigger id="aspectRatio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    id="backgroundColor"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                    className="w-12 h-12 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fillMode">Fill Mode</Label>
                <Select value={settings.fillMode} onValueChange={(value) => updateSetting('fillMode', value)}>
                  <SelectTrigger id="fillMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black-bars">Black Bars</SelectItem>
                    <SelectItem value="crop">Crop</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                    <SelectItem value="blur">Blur Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="masterVolume">Master Volume</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="masterVolume"
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.masterVolume]}
                    onValueChange={([value]) => updateSetting('masterVolume', value)}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{settings.masterVolume}%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="trackVolume">Track Volume</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="trackVolume"
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.trackVolume]}
                    onValueChange={([value]) => updateSetting('trackVolume', value)}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{settings.trackVolume}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="voiceOver">Voice Over</Label>
                <Switch
                  id="voiceOver"
                  checked={settings.voiceOverEnabled}
                  onCheckedChange={(checked) => updateSetting('voiceOverEnabled', checked)}
                />
              </div>

              <div>
                <Label htmlFor="audioQuality">Audio Quality</Label>
                <Select value={settings.audioQuality} onValueChange={(value) => updateSetting('audioQuality', value)}>
                  <SelectTrigger id="audioQuality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128 kbps (Low)</SelectItem>
                    <SelectItem value="256">256 kbps (Medium)</SelectItem>
                    <SelectItem value="320">320 kbps (High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="noiseReduction">Noise Reduction</Label>
                <Switch
                  id="noiseReduction"
                  checked={settings.noiseReduction}
                  onCheckedChange={(checked) => updateSetting('noiseReduction', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Export Settings */}
          <TabsContent value="export" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fileFormat">File Format</Label>
                <Select value={settings.fileFormat} onValueChange={(value) => updateSetting('fileFormat', value)}>
                  <SelectTrigger id="fileFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="mkv">MKV</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="compressionLevel">Compression Level</Label>
                <Select value={settings.compressionLevel} onValueChange={(value) => updateSetting('compressionLevel', value)}>
                  <SelectTrigger id="compressionLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="small">Small File Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bitrateControl">Bitrate Control</Label>
                <RadioGroup
                  value={settings.bitrateControl}
                  onValueChange={(value) => updateSetting('bitrateControl', value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto">Auto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </RadioGroup>
              </div>

              {settings.bitrateControl === "custom" && (
                <div>
                  <Label htmlFor="customBitrate">Custom Bitrate (kbps)</Label>
                  <Input
                    type="number"
                    id="customBitrate"
                    value={settings.customBitrate}
                    onChange={(e) => updateSetting('customBitrate', parseInt(e.target.value))}
                    min={100}
                    max={50000}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="exportThumbnail">Export Thumbnail</Label>
                <Switch
                  id="exportThumbnail"
                  checked={settings.exportThumbnail}
                  onCheckedChange={(checked) => updateSetting('exportThumbnail', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gpuAcceleration">GPU Acceleration</Label>
                <Switch
                  id="gpuAcceleration"
                  checked={settings.gpuAcceleration}
                  onCheckedChange={(checked) => updateSetting('gpuAcceleration', checked)}
                />
              </div>

              <div>
                <Label htmlFor="previewQuality">Preview Quality</Label>
                <Select value={settings.previewQuality} onValueChange={(value) => updateSetting('previewQuality', value)}>
                  <SelectTrigger id="previewQuality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="renderingPreference">Rendering Preference</Label>
                <RadioGroup
                  value={settings.renderingPreference}
                  onValueChange={(value) => updateSetting('renderingPreference', value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="speed" id="speed" />
                    <Label htmlFor="speed">Speed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quality" id="quality" />
                    <Label htmlFor="quality">Quality</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          {/* Editor Preferences */}
          <TabsContent value="preferences" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transitionDuration">Default Transition Duration (seconds)</Label>
                <Input
                  type="number"
                  id="transitionDuration"
                  value={settings.defaultTransitionDuration}
                  onChange={(e) => updateSetting('defaultTransitionDuration', parseFloat(e.target.value))}
                  min={0.1}
                  max={10}
                  step={0.1}
                />
              </div>

              <div>
                <Label htmlFor="exportFolder">Default Export Folder</Label>
                <Input
                  type="text"
                  id="exportFolder"
                  value={settings.defaultExportFolder}
                  onChange={(e) => updateSetting('defaultExportFolder', e.target.value)}
                  placeholder="/exports"
                />
              </div>

              <div>
                <Label htmlFor="autoSave">Auto-Save Interval (minutes)</Label>
                <Select value={settings.autoSaveInterval.toString()} onValueChange={(value) => updateSetting('autoSaveInterval', parseInt(value))}>
                  <SelectTrigger id="autoSave">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="watermarkEnabled">Watermark</Label>
                <Switch
                  id="watermarkEnabled"
                  checked={settings.watermarkEnabled}
                  onCheckedChange={(checked) => updateSetting('watermarkEnabled', checked)}
                />
              </div>

              {settings.watermarkEnabled && (
                <>
                  <div>
                    <Label htmlFor="watermarkText">Watermark Text</Label>
                    <Input
                      type="text"
                      id="watermarkText"
                      value={settings.watermarkText}
                      onChange={(e) => updateSetting('watermarkText', e.target.value)}
                      placeholder="Your Watermark"
                    />
                  </div>

                  <div>
                    <Label htmlFor="watermarkLogo">Watermark Logo (URL)</Label>
                    <Input
                      type="text"
                      id="watermarkLogo"
                      value={settings.watermarkLogo}
                      onChange={(e) => updateSetting('watermarkLogo', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mobileMode">Mobile Mode</Label>
                <Switch
                  id="mobileMode"
                  checked={settings.mobileMode}
                  onCheckedChange={(checked) => updateSetting('mobileMode', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
