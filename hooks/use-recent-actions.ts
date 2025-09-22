// src/hooks/use-recent-actions.ts
import { useState, useEffect, useCallback } from 'react';
import { CommandAction } from '@/lib/actions';

const RECENTS_STORAGE_KEY = 'command-palette-recents';
const MAX_RECENTS = 5;

export const useRecentActions = () => {
  const [recentActionIds, setRecentActionIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedRecents = localStorage.getItem(RECENTS_STORAGE_KEY);
      if (storedRecents) {
        setRecentActionIds(JSON.parse(storedRecents));
      }
    } catch (error) {
      console.error("Failed to load recent actions from localStorage", error);
    }
  }, []);

  const addRecentAction = useCallback((action: CommandAction) => {
    setRecentActionIds(prev => {
      // Remove the action if it already exists to move it to the top
      const filtered = prev.filter(id => id !== action.id);
      // Add the new action to the front
      const newRecents = [action.id, ...filtered];
      // Trim the list to the max size
      const trimmed = newRecents.slice(0, MAX_RECENTS);
      
      try {
        localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(trimmed));
      } catch (error) {
        console.error("Failed to save recent actions to localStorage", error);
      }

      return trimmed;
    });
  }, []);

  return { recentActionIds, addRecentAction };
};
