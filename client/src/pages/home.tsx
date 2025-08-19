import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Settings, Trash2 } from "lucide-react";

import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const recentProjects = projects.slice(0, 5);

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
    <div className="flex flex-col h-screen">
      
      <div className="page-header">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">VideoEdit Pro</h1>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
        
        <Button
          onClick={handleCreateProject}
          className="w-full btn-primary"
        >
          <Plus className="w-5 h-5 mr-3" />
          Create New Project
        </Button>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Recent Projects</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary rounded-2xl p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No projects yet</div>
            <div className="text-gray-500 text-sm">Create your first video project to get started</div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="card-project">
                {project.thumbnail && (
                  <img
                    src={project.thumbnail}
                    alt="Project thumbnail"
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {formatDuration(project.duration)} • Modified {formatRelativeTime(new Date(project.updatedAt))}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={() => setLocation(`/editor/${project.id}`)}
                      className="text-accent hover:text-blue-400 text-sm font-medium p-0 h-auto"
                    >
                      Continue Editing
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="text-gray-400 hover:text-error h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileNav onNavigate={setLocation} />
    </div>
  );
}
