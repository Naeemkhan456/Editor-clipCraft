import { Home, Folder, Wand2, User } from "lucide-react";
import { useLocation } from "wouter";

interface MobileNavProps {
  onNavigate: (path: string) => void;
}

export default function MobileNav({ onNavigate }: MobileNavProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Folder, label: "Projects", path: "/projects" },
    { icon: Wand2, label: "Templates", path: "/templates" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="bg-secondary px-6 py-4">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`nav-button ${isActive ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
