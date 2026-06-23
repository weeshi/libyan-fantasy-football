import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { parse } from "url";
import jwt from "jsonwebtoken";

interface WebSocketMessage {
  type: "subscribe" | "unsubscribe" | "update" | "notification" | "ping" | "pong" | "live-score" | "connected" | "subscribed" | "unsubscribed" | "error";
  channel?: string;
  data?: any;
  timestamp?: number;
  message?: string;
  userId?: number;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  channels?: Set<string>;
  isAlive?: boolean;
}

/**
 * WebSocket Manager for real-time updates
 * Handles subscriptions, broadcasts, and user-specific notifications
 */
export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, Set<AuthenticatedWebSocket>> = new Map(); // userId -> Set of WebSockets
  private channels: Map<string, Set<AuthenticatedWebSocket>> = new Map(); // channel -> Set of WebSockets
  private jwtSecret: string;

  constructor(server: Server, jwtSecret: string) {
    this.jwtSecret = jwtSecret;
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
      this.handleConnection(ws, req);
    });

    // Heartbeat to detect dead connections
    setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  private handleConnection(ws: AuthenticatedWebSocket, req: any) {
    ws.isAlive = true;
    ws.channels = new Set();

    // Authenticate user from query token
    const { query } = parse(req.url || "", true);
    const token = query.token as string;

    if (!token) {
      ws.send(JSON.stringify({ type: "error", message: "Authentication required" }));
      ws.close(1008, "Unauthorized");
      return;
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      ws.userId = decoded.userId;

      // Register client
      if (!this.clients.has(ws.userId)) {
        this.clients.set(ws.userId, new Set());
      }
      this.clients.get(ws.userId)!.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({
        type: "connected",
        userId: ws.userId,
        timestamp: Date.now(),
      }));

      // Handle incoming messages
      ws.on("message", (data: Buffer) => this.handleMessage(ws, data));

      // Handle pong
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      // Handle disconnect
      ws.on("close", () => this.handleDisconnect(ws));

      // Handle errors
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    } catch (error) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      ws.close(1008, "Unauthorized");
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "subscribe":
          this.handleSubscribe(ws, message.channel!);
          break;
        case "unsubscribe":
          this.handleUnsubscribe(ws, message.channel!);
          break;
        case "ping":
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  }

  private handleSubscribe(ws: AuthenticatedWebSocket, channel: string) {
    ws.channels!.add(channel);

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(ws);

    ws.send(JSON.stringify({
      type: "subscribed",
      channel,
      timestamp: Date.now(),
    }));
  }

  private handleUnsubscribe(ws: AuthenticatedWebSocket, channel: string) {
    ws.channels!.delete(channel);

    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(ws);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }

    ws.send(JSON.stringify({
      type: "unsubscribed",
      channel,
      timestamp: Date.now(),
    }));
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    // Remove from user clients
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }

    // Remove from channels
    ws.channels!.forEach((channel) => {
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(ws);
        if (channelClients.size === 0) {
          this.channels.delete(channel);
        }
      }
    });
  }

  /**
   * Broadcast message to all clients in a channel
   */
  public broadcastToChannel(channel: string, message: WebSocketMessage) {
    const clients = this.channels.get(channel);
    if (!clients) return;

    const payload = JSON.stringify({
      ...message,
      channel,
      timestamp: Date.now(),
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  /**
   * Send message to specific user
   */
  public sendToUser(userId: number, message: WebSocketMessage) {
    const clients = this.clients.get(userId);
    if (!clients) return;

    const payload = JSON.stringify({
      ...message,
      timestamp: Date.now(),
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcastAll(message: WebSocketMessage) {
    const payload = JSON.stringify({
      ...message,
      timestamp: Date.now(),
    });

    this.wss.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  /**
   * Get active connections count
   */
  public getConnectionCount(): number {
    return this.wss.clients.size;
  }

  /**
   * Get active channels
   */
  public getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Get users in a channel
   */
  public getUsersInChannel(channel: string): number[] {
    const clients = this.channels.get(channel);
    if (!clients) return [];

    const userIds = new Set<number>();
    clients.forEach((client) => {
      if (client.userId) {
        userIds.add(client.userId);
      }
    });

    return Array.from(userIds);
  }
}

export default WebSocketManager;
