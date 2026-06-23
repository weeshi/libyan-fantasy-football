import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "./useAuth";

interface WebSocketMessage {
  type: string;
  channel?: string;
  data?: any;
  timestamp?: number;
  [key: string]: any;
}

interface UseWebSocketOptions {
  channels?: string[];
  onMessage?: (message: WebSocketMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Custom hook for WebSocket connection and real-time updates
 * Handles authentication, subscriptions, and automatic reconnection
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    channels = [],
    onMessage,
    onConnected,
    onDisconnected,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!user?.id) {
      console.warn("WebSocket: User not authenticated, skipping connection");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const token = localStorage.getItem("auth_token") || "";
      const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnected?.();

        // Subscribe to channels
        channels.forEach((channel) => {
          subscribe(channel);
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        const error = new Error("WebSocket connection error");
        onError?.(error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnected?.();

        // Attempt to reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      setIsConnecting(false);
    }
  }, [user?.id, channels, onMessage, onConnected, onDisconnected, onError, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "subscribe",
          channel,
        })
      );
    }
  }, []);

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "unsubscribe",
          channel,
        })
      );
    }
  }, []);

  /**
   * Send a ping message
   */
  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Effect: Connect on mount and cleanup on unmount
   */
  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  /**
   * Effect: Handle channel subscriptions
   */
  useEffect(() => {
    if (isConnected) {
      channels.forEach((channel) => {
        subscribe(channel);
      });
    }
  }, [channels, isConnected, subscribe]);

  return {
    isConnected,
    isConnecting,
    subscribe,
    unsubscribe,
    ping,
    disconnect,
    connect,
  };
}

export default useWebSocket;
