import { type Project, type InsertProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;

  constructor() {
    this.projects = new Map();
    
    // Add some sample projects for demo
    const sampleProjects: Project[] = [
      {
        id: "1",
        name: "Summer Vacation",
        duration: 154,
        resolution: "1080p",
        aspectRatio: "16:9",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoClips: [],
        audioTracks: [],
        effects: [],
        editHistory: [],
        currentHistoryIndex: -1,
        isExporting: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2", 
        name: "Skate Tricks",
        duration: 47,
        resolution: "720p",
        aspectRatio: "9:16",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoClips: [],
        audioTracks: [],
        effects: [],
        editHistory: [],
        currentHistoryIndex: -1,
        isExporting: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "3",
        name: "Recipe Tutorial", 
        duration: 192,
        resolution: "4K",
        aspectRatio: "16:9",
        thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop",
        videoClips: [],
        audioTracks: [],
        effects: [],
        editHistory: [],
        currentHistoryIndex: -1,
        isExporting: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleProjects.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = { 
      id,
      name: insertProject.name,
      duration: insertProject.duration || 0,
      resolution: insertProject.resolution || "1080p",
      aspectRatio: insertProject.aspectRatio || "16:9",
      thumbnail: insertProject.thumbnail || null,
      videoClips: insertProject.videoClips || [],
      audioTracks: insertProject.audioTracks || [],
      effects: insertProject.effects || [],
      editHistory: insertProject.editHistory || [],
      currentHistoryIndex: insertProject.currentHistoryIndex || -1,
      isExporting: insertProject.isExporting || false,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { 
      ...project, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
