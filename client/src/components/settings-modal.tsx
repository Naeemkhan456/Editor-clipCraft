import { useState, useEffect } from "react";
import { X, Save, RotateCcw, Download, Video, Monitor, Palette, Globe, Bell, Shield, User, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
}

interface VideoSettings {
  defaultResolution: string;
  defaultFormat: string;
  defaultQuality: number;
  autoSave: boolean;
  autoSaveInterval: number;
  enableHardwareAcceleration: boolean;
  maxMemoryUsage: number;
}

interface ExportSettings {
  defaultExportFormat: string;
  defaultExportQuality: number;
  includeMetadata: boolean;
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkPosition: string;
  watermarkOpacity: number;
}

interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
  autoUpdate: boolean;
  analytics: boolean;
}

interface PerformanceSettings {
  cacheSize: number;
  maxConcurrentProcesses: number;
  enableBackgroundProcessing: boolean;
  qualityVsSpeed: 'quality' | 'balanced' | 'speed';
}

export default function SettingsModal({ show, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  
  // Settings state
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    defaultResolution: "1080p",
    defaultFormat: "mp4",
    defaultQuality: 80,
    autoSave: true,
    autoSaveInterval: 5,
    enableHardwareAcceleration: true,
    maxMemoryUsage: 4
  });

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    defaultExportFormat: "mp4",
    defaultExportQuality: 85,
    includeMetadata: true,
    watermarkEnabled: false,
    watermarkText: "Edited with ClipCraft",
    watermarkPosition: "bottom-right",
    watermarkOpacity: 0.7
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: "dark",
    language: "en",
    notifications: true,
    emailNotifications: false,
    autoUpdate: true,
    analytics: true
  });

  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    cacheSize: 2,
    maxConcurrentProcesses: 2,
    enableBackgroundProcessing: true,
    qualityVsSpeed: 'balanced'
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [videoSettings, exportSettings, userPreferences, performanceSettings]);

  const loadSettings = () => {
    try {
      const savedVideoSettings = localStorage.getItem('videoSettings');
      const savedExportSettings = localStorage.getItem('exportSettings');
      const savedUserPreferences = localStorage.getItem('userPreferences');
      const savedPerformanceSettings = localStorage.getItem('performanceSettings');

      if (savedVideoSettings) {
        setVideoSettings(JSON.parse(savedVideoSettings));
      }
      if (savedExportSettings) {
        setExportSettings(JSON.parse(savedExportSettings));
      }
      if (savedUserPreferences) {
        setUserPreferences(JSON.parse(savedUserPreferences));
      }
      if (savedPerformanceSettings) {
        setPerformanceSettings(JSON.parse(savedPerformanceSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('videoSettings', JSON.stringify(videoSettings));
      localStorage.setItem('exportSettings', JSON.stringify(exportSettings));
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
      localStorage.setItem('performanceSettings', JSON.stringify(performanceSettings));
      
      setHasUnsavedChanges(false);
      
      toast({
        title: "✅ Settings saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "❌ Save failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setVideoSettings({
        defaultResolution: "1080p",
        defaultFormat: "mp4",
        defaultQuality: 80,
        autoSave: true,
        autoSaveInterval: 5,
        enableHardwareAcceleration: true,
        maxMemoryUsage: 4
      });
      
      setExportSettings({
        defaultExportFormat: "mp4",
        defaultExportQuality: 85,
        includeMetadata: true,
        watermarkEnabled: false,
        watermarkText: "Edited with ClipCraft",
        watermarkPosition: "bottom-right",
        watermarkOpacity: 0.7
      });
      
      setUserPreferences({
        theme: "dark",
        language: "en",
        notifications: true,
        emailNotifications: false,
        autoUpdate: true,
        analytics: true
      });
      
      setPerformanceSettings({
        cacheSize: 2,
        maxConcurrentProcesses: 2,
        enableBackgroundProcessing: true,
        qualityVsSpeed: 'balanced'
      });
      
      toast({
        title: "🔄 Settings reset",
        description: "All settings have been reset to defaults.",
      });
    }
  };

  const exportSettingsFile = () => {
    try {
      const settingsData = {
        videoSettings,
        exportSettings,
        userPreferences,
        performanceSettings,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clipcraft-settings-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📥 Settings exported",
        description: "Your settings have been exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export settings:', error);
      toast({
        title: "❌ Export failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Settings</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportSettingsFile}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasUnsavedChanges}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            {/* Video Settings Tab */}
            <TabsContent value="video" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-5 h-5" />
                    <span>Video Processing</span>
                  </CardTitle>
                  <CardDescription>
                    Configure default video processing settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultResolution">Default Resolution</Label>
                      <Select
                        value={videoSettings.defaultResolution}
                        onValueChange={(value) => setVideoSettings(prev => ({ ...prev, defaultResolution: value }))}
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

                    <div className="space-y-2">
                      <Label htmlFor="defaultFormat">Default Format</Label>
                      <Select
                        value={videoSettings.defaultFormat}
                        onValueChange={(value) => setVideoSettings(prev => ({ ...prev, defaultFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                          <SelectItem value="avi">AVI</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultQuality">Default Quality: {videoSettings.defaultQuality}%</Label>
                    <Slider
                      value={[videoSettings.defaultQuality]}
                      onValueChange={(value) => setVideoSettings(prev => ({ ...prev, defaultQuality: value[0] }))}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoSave">Auto-save projects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your work every few minutes
                      </p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={videoSettings.autoSave}
                      onCheckedChange={(checked) => setVideoSettings(prev => ({ ...prev, autoSave: checked }))}
                    />
                  </div>

                  {videoSettings.autoSave && (
                    <div className="space-y-2">
                      <Label htmlFor="autoSaveInterval">Auto-save interval: {videoSettings.autoSaveInterval} minutes</Label>
                      <Slider
                        value={[videoSettings.autoSaveInterval]}
                        onValueChange={(value) => setVideoSettings(prev => ({ ...prev, autoSaveInterval: value[0] }))}
                        max={30}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="hardwareAcceleration">Hardware Acceleration</Label>
                      <p className="text-sm text-muted-foreground">
                        Use GPU acceleration for faster processing
                      </p>
                    </div>
                    <Switch
                      id="hardwareAcceleration"
                      checked={videoSettings.enableHardwareAcceleration}
                      onCheckedChange={(checked) => setVideoSettings(prev => ({ ...prev, enableHardwareAcceleration: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMemoryUsage">Max Memory Usage: {videoSettings.maxMemoryUsage} GB</Label>
                    <Slider
                      value={[videoSettings.maxMemoryUsage]}
                      onValueChange={(value) => setVideoSettings(prev => ({ ...prev, maxMemoryUsage: value[0] }))}
                      max={32}
                      min={2}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum memory allocation for video processing
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Settings Tab */}
            <TabsContent value="export" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Export Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Configure default export settings and watermark options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exportFormat">Export Format</Label>
                      <Select
                        value={exportSettings.defaultExportFormat}
                        onValueChange={(value) => setExportSettings(prev => ({ ...prev, defaultExportFormat: value }))}
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
                      <Label htmlFor="exportQuality">Export Quality: {exportSettings.defaultExportQuality}%</Label>
                      <Slider
                        value={[exportSettings.defaultExportQuality]}
                        onValueChange={(value) => setExportSettings(prev => ({ ...prev, defaultExportQuality: value[0] }))}
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="includeMetadata">Include Metadata</Label>
                      <p className="text-sm text-muted-foreground">
                        Preserve video metadata in exports
                      </p>
                    </div>
                    <Switch
                      id="includeMetadata"
                      checked={exportSettings.includeMetadata}
                      onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeMetadata: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="watermarkEnabled">Enable Watermark</Label>
                        <p className="text-sm text-muted-foreground">
                          Add a watermark to exported videos
                        </p>
                      </div>
                      <Switch
                        id="watermarkEnabled"
                        checked={exportSettings.watermarkEnabled}
                        onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, watermarkEnabled: checked }))}
                      />
                    </div>

                    {exportSettings.watermarkEnabled && (
                      <div className="space-y-4 pl-4 border-l-2 border-muted">
                        <div className="space-y-2">
                          <Label htmlFor="watermarkText">Watermark Text</Label>
                          <Input
                            id="watermarkText"
                            value={exportSettings.watermarkText}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
                            placeholder="Enter watermark text"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="watermarkPosition">Position</Label>
                            <Select
                              value={exportSettings.watermarkPosition}
                              onValueChange={(value) => setExportSettings(prev => ({ ...prev, watermarkPosition: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top-left">Top Left</SelectItem>
                                <SelectItem value="top-right">Top Right</SelectItem>
                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="watermarkOpacity">Opacity: {Math.round(exportSettings.watermarkOpacity * 100)}%</Label>
                            <Slider
                              value={[exportSettings.watermarkOpacity]}
                              onValueChange={(value) => setExportSettings(prev => ({ ...prev, watermarkOpacity: value[0] }))}
                              max={1}
                              min={0.1}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Settings Tab */}
            <TabsContent value="performance" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Performance & Resources</span>
                  </CardTitle>
                  <CardDescription>
                    Optimize performance and resource usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualityVsSpeed">Quality vs Speed Balance</Label>
                    <Select
                      value={performanceSettings.qualityVsSpeed}
                      onValueChange={(value: 'quality' | 'balanced' | 'speed') => 
                        setPerformanceSettings(prev => ({ ...prev, qualityVsSpeed: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quality">High Quality (Slower)</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="speed">Fast Processing (Lower Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cacheSize">Cache Size: {performanceSettings.cacheSize} GB</Label>
                    <Slider
                      value={[performanceSettings.cacheSize]}
                      onValueChange={(value) => setPerformanceSettings(prev => ({ ...prev, cacheSize: value[0] }))}
                      max={16}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Increase cache size for better performance with large projects
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxConcurrentProcesses">Max Concurrent Processes: {performanceSettings.maxConcurrentProcesses}</Label>
                    <Slider
                      value={[performanceSettings.maxConcurrentProcesses]}
                      onValueChange={(value) => setPerformanceSettings(prev => ({ ...prev, maxConcurrentProcesses: value[0] }))}
                      max={8}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Higher values use more CPU but process faster
                    </p>
                  </div>



                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="backgroundProcessing">Background Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow processing to continue when app is minimized
                      </p>
                    </div>
                    <Switch
                      id="backgroundProcessing"
                      checked={performanceSettings.enableBackgroundProcessing}
                      onCheckedChange={(checked) => setPerformanceSettings(prev => ({ ...prev, enableBackgroundProcessing: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>User Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Customize your experience and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={userPreferences.theme}
                        onValueChange={(value) => setUserPreferences(prev => ({ ...prev, theme: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={userPreferences.language}
                        onValueChange={(value) => setUserPreferences(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications for completed tasks
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={userPreferences.notifications}
                        onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, notifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your projects
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={userPreferences.emailNotifications}
                        onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Privacy & Updates</span>
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="autoUpdate">Auto Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically download and install updates
                        </p>
                      </div>
                      <Switch
                        id="autoUpdate"
                        checked={userPreferences.autoUpdate}
                        onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, autoUpdate: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="analytics">Usage Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Help improve ClipCraft by sharing anonymous usage data
                        </p>
                      </div>
                      <Switch
                        id="analytics"
                        checked={userPreferences.analytics}
                        onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, analytics: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings Tab */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Advanced Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced configuration options for power users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">FFmpeg Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Advanced FFmpeg settings for video processing
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Thread Count:</span>
                          <span className="text-sm font-mono">Auto-detect</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Memory Limit:</span>
                          <span className="text-sm font-mono">{videoSettings.maxMemoryUsage}GB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Hardware Acceleration:</span>
                          <span className="text-sm font-mono">
                            {videoSettings.enableHardwareAcceleration ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Cache Management</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Manage temporary files and cache storage
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Clear Cache
                        </Button>
                        <Button variant="outline" size="sm">
                          View Cache Location
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Debug Information</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enable detailed logging for troubleshooting
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Debug Mode:</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
