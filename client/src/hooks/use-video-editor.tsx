import { useState, useCallback } from "react";
import type { Project, EditAction } from "@shared/schema";

export function useVideoEditor(project: Project | undefined) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [editHistory, setEditHistory] = useState<EditAction[]>(project?.editHistory || []);
  const [historyIndex, setHistoryIndex] = useState(project?.currentHistoryIndex || -1);

  const duration = project?.duration || 15; // Default 15 seconds for demo

  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, time)));
  }, [duration]);

  const addEditAction = useCallback((action: Omit<EditAction, "timestamp">) => {
    const newAction: EditAction = {
      ...action,
      timestamp: Date.now(),
    };

    // Remove any actions after current index (for redo functionality)
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newAction);

    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [editHistory, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > -1) {
      setHistoryIndex(historyIndex - 1);
      
      // Apply the undo action here
      addEditAction({
        type: "undo",
        data: editHistory[historyIndex],
        description: `Undo: ${editHistory[historyIndex]?.description}`,
      });
    }
  }, [historyIndex, editHistory, addEditAction]);

  const redo = useCallback(() => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      
      // Apply the redo action here
      addEditAction({
        type: "redo", 
        data: editHistory[historyIndex + 1],
        description: `Redo: ${editHistory[historyIndex + 1]?.description}`,
      });
    }
  }, [historyIndex, editHistory, addEditAction]);

  const canUndo = historyIndex > -1;
  const canRedo = historyIndex < editHistory.length - 1;

  const updateSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    addEditAction({
      type: "speed_change",
      data: { speed: newSpeed, previousSpeed: speed },
      description: `Change speed to ${newSpeed}x`,
    });
  }, [speed, addEditAction]);

  return {
    isPlaying,
    currentTime,
    duration,
    speed,
    canUndo,
    canRedo,
    togglePlayback,
    seekTo,
    setSpeed: updateSpeed,
    setCurrentTime,
    setDuration: () => {}, // Placeholder function
    undo,
    redo,
    addEditAction,
    editHistory,
    historyIndex,
  };
}