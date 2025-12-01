import { useState, useCallback } from 'react';

export interface ActionHistoryItem {
  type: 'measurement' | 'config' | 'scale' | 'zoom' | 'other';
  data: any;
  timestamp: number;
}

export const useActionHistory = () => {
  const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);
  const maxHistorySize = 50;

  const saveAction = useCallback((type: ActionHistoryItem['type'], data: any) => {
    setActionHistory(prev => {
      const newHistory = [
        ...prev,
        {
          type,
          data,
          timestamp: Date.now(),
        },
      ];
      // Limitar o tamanho do histórico
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      return newHistory;
    });
  }, []);

  const undoLastAction = useCallback((): ActionHistoryItem | null => {
    if (actionHistory.length === 0) {
      return null;
    }

    const lastAction = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    return lastAction;
  }, [actionHistory]);

  const clearHistory = useCallback(() => {
    setActionHistory([]);
  }, []);

  const canUndo = actionHistory.length > 0;

  const getHistoryCount = useCallback(() => {
    return actionHistory.length;
  }, [actionHistory]);

  const getLastAction = useCallback((): ActionHistoryItem | null => {
    if (actionHistory.length === 0) {
      return null;
    }
    return actionHistory[actionHistory.length - 1];
  }, [actionHistory]);

  return {
    actionHistory,
    canUndo,
    saveAction,
    undoLastAction,
    clearHistory,
    getHistoryCount,
    getLastAction,
  };
};

