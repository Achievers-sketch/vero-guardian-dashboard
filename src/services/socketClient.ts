'use client';

import { io, type Socket } from 'socket.io-client';

export type SocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SocketStateEvent {
  event: string;
  data: unknown;
}

type StatusListener = (status: SocketConnectionStatus) => void;
type EventListener = (event: SocketStateEvent) => void;
type ErrorListener = (error: string) => void;

const listeners = new Set<EventListener>();
const statusListeners = new Set<StatusListener>();
const errorListeners = new Set<ErrorListener>();

let socket: Socket | null = null;
let connectionStatus: SocketConnectionStatus = 'disconnected';
let activeUrl = '';

function notifyStatus(status: SocketConnectionStatus): void {
  connectionStatus = status;
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch {
      /* isolate listener errors */
    }
  });
}

function notifyEvent(event: SocketStateEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      /* isolate listener errors */
    }
  });
}

function notifyError(error: string): void {
  errorListeners.forEach((listener) => {
    try {
      listener(error);
    } catch {
      /* isolate listener errors */
    }
  });
}

export function connectSocket(
  url?: string,
  authToken?: string,
): Socket {
  const targetUrl = url?.trim() || process.env.NEXT_PUBLIC_SOCKET_IO_URL?.trim() || '';
  if (!targetUrl) {
    notifyError('SOCKET_IO_URL not configured');
    notifyStatus('error');
    throw new Error('Socket.IO URL not configured. Set NEXT_PUBLIC_SOCKET_IO_URL.');
  }

  if (socket && activeUrl === targetUrl && socket.connected) {
    return socket;
  }

  disconnectSocket();
  activeUrl = targetUrl;
  notifyStatus('connecting');

  const auth = authToken ? { token: authToken } : undefined;

  socket = io(targetUrl, {
    auth,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    timeout: 10_000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    notifyStatus('connected');
  });

  socket.on('disconnect', (reason) => {
    notifyStatus('disconnected');
    if (reason === 'io server disconnect') {
      notifyError('Server disconnected the socket');
    }
  });

  socket.on('connect_error', (err) => {
    notifyError(err.message);
    notifyStatus('error');
  });

  socket.on('reconnect_attempt', () => {
    notifyStatus('connecting');
  });

  socket.on('reconnect', () => {
    notifyStatus('connected');
  });

  socket.onAny((event, ...args) => {
    notifyEvent({ event, data: args.length === 1 ? args[0] : args });
  });

  return socket;
let socket: Socket | null = null;
let status: SocketConnectionStatus = 'disconnected';
let connectionUrl: string | undefined;
let authToken: string | undefined;

const statusListeners = new Set<StatusListener>();
const eventListeners = new Set<EventListener>();
const errorListeners = new Set<ErrorListener>();

function notifyStatus(newStatus: SocketConnectionStatus): void {
  status = newStatus;
  statusListeners.forEach((fn) => fn(newStatus));
}

function getDefaultUrl(): string {
  const url = process.env.NEXT_PUBLIC_SOCKET_IO_URL;
  if (!url) {
    throw new Error(
      'Socket.IO URL not configured. Set NEXT_PUBLIC_SOCKET_IO_URL env var.',
    );
  }
  return url;
}

export function connectSocket(url?: string, token?: string): void {
  if (socket) return;

  connectionUrl = url ?? getDefaultUrl();
  authToken = token;

  notifyStatus('connecting');

  socket = io(connectionUrl, {
    autoConnect: true,
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => notifyStatus('connected'));
  socket.on('disconnect', () => notifyStatus('disconnected'));
  socket.on('connect_error', (err) => {
    notifyStatus('error');
    errorListeners.forEach((fn) => fn(err.message));
  });

  socket.onAny((event, ...args) => {
    const data = args.length === 1 ? args[0] : args;
    eventListeners.forEach((fn) => fn({ event, data }));
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  activeUrl = '';
  notifyStatus('disconnected');
}

export function updateAuthToken(token: string): void {
  if (socket) {
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }
}

export function subscribeSocketEvents(
  eventName: string,
  handler: (data: unknown) => void,
): () => void {
  if (!socket) {
    return () => {};
  }
  socket.on(eventName, handler);
  return () => {
    socket?.off(eventName, handler);
  };
}

export function onSocketEvent(listener: EventListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function onSocketStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
  notifyStatus('disconnected');
}

export function getSocketStatus(): SocketConnectionStatus {
  return status;
}

export function getSocket(): Socket | null {
  return socket;
}

export function emitSocketEvent(event: string, data: unknown): void {
  socket?.emit(event, data);
}

export function updateAuthToken(token: string): void {
  authToken = token;
  if (socket) {
    socket.auth = { token };
    socket.disconnect();
    socket.connect();
  }
}

export function onSocketStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  return () => void statusListeners.delete(listener);
}

export function onSocketEvent(listener: EventListener): () => void {
  eventListeners.add(listener);
  return () => void eventListeners.delete(listener);
}

export function onSocketError(listener: ErrorListener): () => void {
  errorListeners.add(listener);
  return () => errorListeners.delete(listener);
}

export function getSocketStatus(): SocketConnectionStatus {
  return connectionStatus;
}

export function getSocket(): Socket | null {
  return socket;
}

export function emitSocketEvent(event: string, ...args: unknown[]): void {
  socket?.emit(event, ...args);
}

export function resetSocketClientForTests(): void {
  listeners.clear();
  statusListeners.clear();
  errorListeners.clear();
  disconnectSocket();
  connectionStatus = 'disconnected';
  activeUrl = '';
  return () => void errorListeners.delete(listener);
}

export function resetSocketClientForTests(): void {
  statusListeners.clear();
  eventListeners.clear();
  errorListeners.clear();
  disconnectSocket();
  status = 'disconnected';
  connectionUrl = undefined;
  authToken = undefined;
}
