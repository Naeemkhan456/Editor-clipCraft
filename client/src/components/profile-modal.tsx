import { useState, useEffect, useRef } from "react";
import { X, Save, Camera, Edit3, Lock, Mail, User, Shield, CreditCard, Download, Upload, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  show: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  language: string;
  timezone: string;
  joinDate: string;
  lastActive: string;
  subscription: {
    plan: string;
    status: string;
    expiresAt: string;
    features: string[];
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    publicProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showJoinDate: boolean;
  };
  stats: {
    projectsCreated: number;
    videosExported: number;
    totalStorageUsed: number;
    maxStorage: number;
    memberSince: string;
  };
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  backupCodes: string[];
  loginHistory: Array<{
    date: string;
    location: string;
    device: string;
    ip: string;
  }>;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
  }>;
}

export default function ProfileModal({ show, onClose }: ProfileModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: "user-123",
    username: "videocreator",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    bio: "Passionate video creator and editor. Love making creative content that tells stories.",
    avatar: "",
    location: "New York, NY",
    website: "https://johndoe.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    gender: "prefer-not-to-say",
    language: "en",
    timezone: "America/New_York",
    joinDate: "2023-01-15",
    lastActive: new Date().toISOString(),
    subscription: {
      plan: "Pro",
      status: "active",
      expiresAt: "2024-12-31",
      features: ["4K Export", "Unlimited Projects", "Advanced Filters", "Priority Support"]
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      publicProfile: true,
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showJoinDate: true
    },
    stats: {
      projectsCreated: 47,
      videosExported: 156,
      totalStorageUsed: 2.3,
      maxStorage: 100,
      memberSince: "2023-01-15"
    }
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    backupCodes: ["ABC123", "DEF456", "GHI789", "JKL012"],
    loginHistory: [
      {
        date: "2024-01-15T10:30:00Z",
        location: "New York, NY",
        device: "Chrome on Windows",
        ip: "192.168.1.100"
      },
      {
        date: "2024-01-14T15:45:00Z",
        location: "New York, NY",
        device: "Safari on iPhone",
        ip: "192.168.1.101"
      }
    ],
    activeSessions: [
      {
        id: "session-1",
        device: "Chrome on Windows",
        location: "New York, NY",
        lastActive: "2024-01-15T10:30:00Z"
      }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isEditing);
  }, [isEditing, profile]);

  const loadProfile = () => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const saveProfile = () => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      setHasUnsavedChanges(false);
      
      toast({
        title: "✅ Profile saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "❌ Save failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updatePreferences = (field: keyof UserProfile['preferences'], value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const updateSecurity = (field: keyof SecuritySettings, value: any) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  const changePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "❌ Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (security.newPassword.length < 8) {
      toast({
        title: "❌ Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically make an API call to change the password
    toast({
      title: "✅ Password changed",
      description: "Your password has been updated successfully.",
    });

    setSecurity(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));
  };

  const revokeSession = (sessionId: string) => {
    setSecurity(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(session => session.id !== sessionId)
    }));
    
    toast({
      title: "🔒 Session revoked",
      description: "The selected session has been terminated.",
    });
  };

  const exportProfileData = () => {
    try {
      const profileData = {
        profile,
        security: {
          ...security,
          currentPassword: undefined,
          newPassword: undefined,
          confirmPassword: undefined
        },
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📥 Profile exported",
        description: "Your profile data has been exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export profile:', error);
      toast({
        title: "❌ Export failed",
        description: "Failed to export profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      toast({
        title: "🗑️ Account deletion",
        description: "Account deletion request submitted. You will receive a confirmation email.",
      });
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Profile & Account</h2>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={saveProfile}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportProfileData}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Subscription</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your personal profile information and avatar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profile.avatar} alt={profile.firstName} />
                        <AvatarFallback className="text-2xl">
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                          onClick={triggerAvatarUpload}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profile.firstName}
                            onChange={(e) => updateProfile('firstName', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profile.lastName}
                            onChange={(e) => updateProfile('lastName', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => updateProfile('username', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                  <Separator />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => updateProfile('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => updateProfile('website', e.target.value)}
                        disabled={!isEditing}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Additional Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => updateProfile('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => updateProfile('location', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={profile.gender}
                          onValueChange={(value) => updateProfile('gender', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={profile.timezone}
                          onValueChange={(value) => updateProfile('timezone', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Statistics */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Your Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{profile.stats.projectsCreated}</div>
                        <div className="text-sm text-muted-foreground">Projects</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{profile.stats.videosExported}</div>
                        <div className="text-sm text-muted-foreground">Videos</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{profile.stats.totalStorageUsed}GB</div>
                        <div className="text-sm text-muted-foreground">Used</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{profile.stats.maxStorage}GB</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your password, two-factor authentication, and active sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Change Password</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={security.currentPassword}
                            onChange={(e) => updateSecurity('currentPassword', e.target.value)}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={security.newPassword}
                            onChange={(e) => updateSecurity('newPassword', e.target.value)}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={security.confirmPassword}
                            onChange={(e) => updateSecurity('confirmPassword', e.target.value)}
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button onClick={changePassword} className="w-full">
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="2fa">Enable 2FA</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        id="2fa"
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) => updateSecurity('twoFactorEnabled', checked)}
                      />
                    </div>
                    {security.twoFactorEnabled && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h5 className="font-medium mb-2">Backup Codes</h5>
                        <p className="text-sm text-muted-foreground mb-3">
                          Save these codes in a secure place. You can use them to access your account if you lose your 2FA device.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {security.backupCodes.map((code, index) => (
                            <div key={index} className="font-mono text-sm bg-background p-2 rounded text-center">
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Active Sessions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Active Sessions</h4>
                    <div className="space-y-3">
                      {security.activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{session.device}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.location} • Last active: {new Date(session.lastActive).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Login History */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Login Activity</h4>
                    <div className="space-y-3">
                      {security.loginHistory.map((login, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{login.device}</div>
                            <div className="text-sm text-muted-foreground">
                              {login.location} • {new Date(login.date).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {login.ip}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Subscription & Billing</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{profile.subscription.plan} Plan</h3>
                        <p className="text-muted-foreground">
                          {profile.subscription.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <Badge variant={profile.subscription.status === 'active' ? 'default' : 'secondary'}>
                        {profile.subscription.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Expires:</span>
                        <span className="text-sm font-medium">
                          {new Date(profile.subscription.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage:</span>
                        <span className="text-sm font-medium">
                          {profile.stats.totalStorageUsed}GB / {profile.stats.maxStorage}GB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Plan Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Billing Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Billing Actions</h4>
                    <div className="flex space-x-3">
                      <Button variant="outline">
                        Update Payment Method
                      </Button>
                      <Button variant="outline">
                        View Billing History
                      </Button>
                      <Button variant="outline">
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Privacy & Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Control your privacy settings and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Preferences</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive important updates via email
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={profile.preferences.emailNotifications}
                          onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications in the app
                          </p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={profile.preferences.pushNotifications}
                          onCheckedChange={(checked) => updatePreferences('pushNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="marketingEmails">Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive promotional content and updates
                          </p>
                        </div>
                        <Switch
                          id="marketingEmails"
                          checked={profile.preferences.marketingEmails}
                          onCheckedChange={(checked) => updatePreferences('marketingEmails', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Privacy Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Privacy Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="publicProfile">Public Profile</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow others to view your profile
                          </p>
                        </div>
                        <Switch
                          id="publicProfile"
                          checked={profile.preferences.publicProfile}
                          onCheckedChange={(checked) => updatePreferences('publicProfile', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="showEmail">Show Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Display your email on your public profile
                          </p>
                        </div>
                        <Switch
                          id="showEmail"
                          checked={profile.preferences.showEmail}
                          onCheckedChange={(checked) => updatePreferences('showEmail', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="showPhone">Show Phone</Label>
                          <p className="text-sm text-muted-foreground">
                            Display your phone number on your public profile
                          </p>
                        </div>
                        <Switch
                          id="showPhone"
                          checked={profile.preferences.showPhone}
                          onCheckedChange={(checked) => updatePreferences('showPhone', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="showLocation">Show Location</Label>
                          <p className="text-sm text-muted-foreground">
                            Display your location on your public profile
                          </p>
                        </div>
                        <Switch
                          id="showLocation"
                          checked={profile.preferences.showLocation}
                          onCheckedChange={(checked) => updatePreferences('showLocation', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Account Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Account Actions</h4>
                    <div className="flex space-x-3">
                      <Button variant="outline" onClick={exportProfileData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                      <Button variant="destructive" onClick={deleteAccount}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
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
