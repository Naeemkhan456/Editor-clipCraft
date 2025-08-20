import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, Save, User, Mail, Globe, Twitter, Instagram, Link2 } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (profile: any) => void;
}

interface Profile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  occupation: string;
  social: {
    twitter: string;
    instagram: string;
    website: string;
    linkedin: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

export default function ProfileModal({ open, onOpenChange, onProfileUpdate }: ProfileModalProps) {
  const [profile, setProfile] = useState<Profile>({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Professional video editor and content creator with 5+ years of experience. Specializing in cinematic storytelling and motion graphics.",
    location: "San Francisco, CA",
    occupation: "Senior Video Editor",
    social: {
      twitter: "@johndoe",
      instagram: "@johndoe",
      website: "https://johndoe.com",
      linkedin: "john-doe"
    },
    preferences: {
      theme: 'system',
      notifications: true,
      language: 'en'
    }
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({...profile, avatar: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onProfileUpdate(profile);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setProfile({
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Professional video editor and content creator with 5+ years of experience. Specializing in cinematic storytelling and motion graphics.",
      location: "San Francisco, CA",
      occupation: "Senior Video Editor",
      social: {
        twitter: "@johndoe",
        instagram: "@johndoe",
        website: "https://johndoe.com",
        linkedin: "john-doe"
      },
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en'
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Profile Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['profile', 'social', 'preferences'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">Change Photo</span>
                        </div>
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={profile.occupation}
                        onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                        placeholder="Your job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="twitter" className="flex items-center space-x-2">
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </Label>
                    <Input
                      id="twitter"
                      value={profile.social.twitter}
                      onChange={(e) => setProfile({...profile, social: {...profile.social, twitter: e.target.value}})}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram" className="flex items-center space-x-2">
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                    </Label>
                    <Input
                      id="instagram"
                      value={profile.social.instagram}
                      onChange={(e) => setProfile({...profile, social: {...profile.social, instagram: e.target.value}})}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="flex items-center space-x-2">
                      <Link2 className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </Label>
                    <Input
                      id="linkedin"
                      value={profile.social.linkedin}
                      onChange={(e) => setProfile({...profile, social: {...profile.social, linkedin: e.target.value}})}
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={profile.social.website}
                      onChange={(e) => setProfile({...profile, social: {...profile.social, website: e.target.value}})}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="flex space-x-2 mt-2">
                      {(['light', 'dark', 'system'] as const).map((theme) => (
                        <Badge
                          key={theme}
                          variant={profile.preferences.theme === theme ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setProfile({...profile, preferences: {...profile.preferences, theme}})}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <select
                      value={profile.preferences.language}
                      onChange={(e) => setProfile({...profile, preferences: {...profile.preferences, language: e.target.value}})}
                      className="w-full mt-2 p-2 border border-gray-300 rounded"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={profile.preferences.notifications}
                      onChange={(e) => setProfile({...profile, preferences: {...profile.preferences, notifications: e.target.checked}})}
                      className="rounded"
                    />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[100px]"
            >
              {isSaving ? "Saving..." : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
