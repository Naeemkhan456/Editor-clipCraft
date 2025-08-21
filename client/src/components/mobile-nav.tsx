import { useState } from "react";
import { Home, Folder, Wand2, User } from "lucide-react";
import { useLocation } from "wouter";
import TemplateModal from "@/components/template-modal";
import ProfileModal from "@/components/profile-modal";

interface MobileNavProps {
  onNavigate: (path: string) => void;
}

export default function MobileNav({ onNavigate }: MobileNavProps) {
  const [location] = useLocation();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleTemplateSelect = (template: string) => {
    console.log("Selected template:", template);
    setTemplatesOpen(false);
  };

  const handleProfileUpdate = (profile: any) => {
    console.log("Updated profile:", profile);
    setProfileOpen(false);
  };

  const handleNavClick = (path: string) => {
    if (path === "/templates") {
      setTemplatesOpen(true);
    } else if (path === "/profile") {
      setProfileOpen(true);
    } else {
      onNavigate(path);
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Folder, label: "Projects", path: "/projects" },
    { icon: Wand2, label: "Templates", path: "/templates" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <>
      <nav className="bg-secondary px-6 py-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`nav-button ${isActive ? "active" : ""}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <TemplateModal 
        open={templatesOpen} 
        onOpenChange={setTemplatesOpen} 
        onTemplateSelect={handleTemplateSelect}
      />
      <ProfileModal 
        open={profileOpen} 
        onOpenChange={setProfileOpen} 
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
