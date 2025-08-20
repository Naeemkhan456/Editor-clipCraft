import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Settings, Trash2, Search, Film, Clock, Calendar } from "lucide-react";

import MobileNav from "@/components/mobile-nav";
import SettingsModal from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "recent" | "oldest">("all");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterType === "recent") {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } else if (filterType === "oldest") {
      filtered = [...filtered].sort((a, b) => 
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
    }
    
    return filtered.slice(0, 6);
  }, [projects, searchQuery, filterType]);

  const handleCreateProject = async () => {
    try {
      const response = await apiRequest("POST", "/api/projects", {
        name: `New Project ${projects.length + 1}`,
        duration: 0,
        resolution: "1080p",
        aspectRatio: "16:9",
        videoClips: [],
        audioTracks: [],
        effects: [],
        editHistory: [],
        currentHistoryIndex: -1,
        isExporting: false,
      });

      const newProject = await response.json();
      setLocation(`/editor/${newProject.id}`);
      
      toast({
        title: "Project created",
        description: "New video project has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
      
      toast({
        title: "Project deleted",
        description: `"${projectName}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} min`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Modern Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6344fd] to-purple-400 bg-clip-text text-transparent">
                VideoEdit Pro
              </h1>
              <p className="text-gray-400 text-sm mt-1">Professional video editing made simple</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[#6344fd]/20 hover:bg-[#6344fd]/30 text-[#6344fd] transition-all duration-200"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Create Amazing Videos
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Transform your ideas into stunning videos with our powerful editing tools
          </p>
          <Button
            onClick={handleCreateProject}
            className="bg-[#6344fd] hover:bg-[#6344fd]/90 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg shadow-[#6344fd]/30 transition-all duration-200 hover:shadow-xl hover:shadow-[#6344fd]/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Project
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 rounded-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              className={`${filterType === "all" ? "bg-[#6344fd] text-white" : "border-gray-600 text-gray-300"} rounded-full`}
            >
              All
            </Button>
            <Button
              variant={filterType === "recent" ? "default" : "outline"}
              onClick={() => setFilterType("recent")}
              className={`${filterType === "recent" ? "bg-[#6344fd] text-white" : "border-gray-600 text-gray-300"} rounded-full`}
            >
              Recent
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                <div className="aspect-video bg-gray-700 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-400 mb-6">Start creating your first video project</p>
              <Button
                onClick={handleCreateProject}
                className="bg-[#6344fd] hover:bg-[#6344fd]/90 text-white px-6 py-2 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project: Project) => (
              <div key={project.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 hover:shadow-xl hover:shadow-[#6344fd]/20">
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">{project.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(project.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatRelativeTime(new Date(project.updatedAt))}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setLocation(`/editor/${project.id}`)}
                      className="flex-1 bg-[#6344fd] hover:bg-[#6344fd]/90 text-white text-sm rounded-full"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="border-gray-600 text-gray-300 hover:text-red-400 hover:border-red-400 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <MobileNav onNavigate={setLocation} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
