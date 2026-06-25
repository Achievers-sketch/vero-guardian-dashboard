'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { useSocketIO, type UseSocketIOResult } from '@/hooks/useSocketIO';

const SocketIOContext = createContext<UseSocketIOResult | null>(null);

export function SocketIOProvider({ children }: { children: ReactNode }) {
  const socket = useSocketIO({
    autoConnect: true,
    invalidateOnEvent: true,
  });

  return (
    <SocketIOContext.Provider value={socket}>
      {children}
    </SocketIOContext.Provider>
  );
}

export function useSocketIOContext(): UseSocketIOResult {
  const ctx = useContext(SocketIOContext);
  if (!ctx) {
    throw new Error('useSocketIOContext must be used within a SocketIOProvider');
  }
  return ctx;
}
