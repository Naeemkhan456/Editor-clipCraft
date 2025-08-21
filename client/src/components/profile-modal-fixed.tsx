import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (profile: any) => void;
}

export default function ProfileModal({
  open,
  onOpenChange,
  onProfileUpdate,
}: ProfileModalProps) {
  const [profile, setProfile] = useState({
    name: "Naeem Khan",
    email: "futuretech492@gmail.com",
    avatar: "https://via.placeholder.com/100x100/4CAF50/fff?text=NK",
    bio: "Video editor",
    social: {
      twitter: "@naeemkhan",
      instagram: "@naeemkhan",
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onProfileUpdate(profile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300">
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition text-white"
              title="Change avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="What do you do?"
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={profile.social.twitter}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  social: { ...profile.social, twitter: e.target.value },
                })
              }
              placeholder="@handle"
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={profile.social.instagram}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  social: { ...profile.social, instagram: e.target.value },
                })
              }
              placeholder="@handle"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
