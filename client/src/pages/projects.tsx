import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, SortAsc } from "lucide-react";

import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import type { Project } from "@shared/schema";

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const formatInfo = (project: Project) => {
    const minutes = Math.floor(project.duration / 60);
    const seconds = project.duration % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return `${duration} • ${project.resolution}`;
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "recent", label: "Recent" },
    { id: "drafts", label: "Drafts" },
  ];

  const filteredProjects = projects.filter(project => {
    if (activeFilter === "recent") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(project.updatedAt as any) > weekAgo;
    }
    if (activeFilter === "drafts") {
      return project.duration < 60; // Consider short videos as drafts
    }
    return true;
  });

  return (
    <div className="flex flex-col h-screen">
      
      <div className="page-header">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <SortAsc className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-4">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === filter.id 
                  ? "bg-accent text-white" 
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-secondary rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full h-24 bg-gray-700"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No projects found</div>
            <div className="text-gray-500 text-sm">
              {activeFilter === "all" 
                ? "Create your first project to get started"
                : `No ${activeFilter} projects available`
              }
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setLocation(`/editor/${project.id}`)}
                className="card-project"
              >
                {project.thumbnail && (
                  <img
                    src={project.thumbnail}
                    alt="Project thumbnail"
                    className="w-full h-24 object-cover"
                  />
                )}
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 truncate">{project.name}</h3>
                  <p className="text-xs text-gray-400">{formatInfo(project)}</p>
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
