import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  duration: real("duration").notNull().default(0),
  resolution: text("resolution").notNull().default("1080p"),
  aspectRatio: text("aspect_ratio").notNull().default("16:9"),
  thumbnail: text("thumbnail"),
  videoClips: json("video_clips").$type<VideoClip[]>().default([]),
  audioTracks: json("audio_tracks").$type<AudioTrack[]>().default([]),
  effects: json("effects").$type<Effect[]>().default([]),
  editHistory: json("edit_history").$type<EditAction[]>().default([]),
  currentHistoryIndex: real("current_history_index").default(-1),
  isExporting: boolean("is_exporting").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export interface VideoClip {
  id: string;
  file: File | string;
  startTime: number;
  endTime: number;
  speed: number;
  volume: number;
  filters: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface AudioTrack {
  id: string;
  file: File | string;
  startTime: number;
  endTime: number;
  volume: number;
}

export interface Effect {
  id: string;
  type: string;
  parameters: Record<string, any>;
  startTime: number;
  endTime: number;
}

export interface EditAction {
  type: string;
  timestamp: number;
  data: any;
  description: string;
}

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
