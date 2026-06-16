'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { getPublicKey } from '@stellar/freighter-api';

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = 'vero_wallet_publicKey';
const FREIGHTER_EVENT = 'freighter-account-change';

/**
 * WalletProvider component that manages Freighter wallet connection state
 * with localStorage persistence and event listeners.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize wallet state from localStorage on mount
   */
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to restore from localStorage
        const storedKey = localStorage.getItem(STORAGE_KEY);
        if (storedKey) {
          setPublicKey(storedKey);
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
        setError('Failed to initialize wallet');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, []);

  /**
   * Set up Freighter account change listener
   */
  useEffect(() => {
    const handleAccountChange = () => {
      // When account changes, clear the stored key and disconnect
      localStorage.removeItem(STORAGE_KEY);
      setPublicKey(null);
      setError(null);
    };

    window.addEventListener(FREIGHTER_EVENT, handleAccountChange);

    return () => {
      window.removeEventListener(FREIGHTER_EVENT, handleAccountChange);
    };
  }, []);

  /**
   * Connect to Freighter wallet using getPublicKey
   */
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Freighter is installed
      if (!window.freighter) {
        throw new Error('Freighter wallet is not installed');
      }

      // Get public key from Freighter
      const key = await getPublicKey();
      setPublicKey(key);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, key);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disconnect from wallet and clear stored key
   */
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: WalletContextType = {
    publicKey,
    isConnected: publicKey !== null,
    isLoading,
    error,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context
 * @throws {Error} If used outside of WalletProvider
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
