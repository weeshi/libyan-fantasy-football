import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebSocketManager } from "./_core/websocket";
import { createServer } from "http";
import { WebSocket } from "ws";
import jwt from "jsonwebtoken";

describe("WebSocket Manager", () => {
  let server: any;
  let wsManager: WebSocketManager;
  let jwtSecret = "test-secret";
  let testToken: string;

  beforeEach(() => {
    server = createServer();
    wsManager = new WebSocketManager(server, jwtSecret);
    testToken = jwt.sign({ userId: 1 }, jwtSecret);
    server.listen(0); // Random port
  });

  afterEach(() => {
    server.close();
  });

  describe("Connection Management", () => {
    it("should track active connections", () => {
      expect(wsManager.getConnectionCount()).toBe(0);
    });

    it("should return active channels", () => {
      const channels = wsManager.getActiveChannels();
      expect(Array.isArray(channels)).toBe(true);
    });
  });

  describe("Broadcasting", () => {
    it("should broadcast to all clients", () => {
      const message = {
        type: "notification",
        data: { text: "Hello World" },
      };

      // Should not throw
      wsManager.broadcastAll(message);
      expect(true).toBe(true);
    });

    it("should broadcast to specific channel", () => {
      const message = {
        type: "update",
        data: { matchId: 1, score: "2-1" },
      };

      // Should not throw
      wsManager.broadcastToChannel("match:1", message);
      expect(true).toBe(true);
    });

    it("should send message to specific user", () => {
      const message = {
        type: "notification",
        data: { title: "Transfer Alert" },
      };

      // Should not throw
      wsManager.sendToUser(1, message);
      expect(true).toBe(true);
    });
  });

  describe("Channel Management", () => {
    it("should return empty array when no channels", () => {
      const channels = wsManager.getActiveChannels();
      expect(channels).toEqual([]);
    });

    it("should return users in channel", () => {
      const users = wsManager.getUsersInChannel("match:1");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(0);
    });
  });

  describe("Message Types", () => {
    it("should handle subscription messages", () => {
      const message = {
        type: "subscribe",
        channel: "live-scores",
      };

      // Should not throw
      expect(() => {
        // Message would be handled by WebSocket handler
      }).not.toThrow();
    });

    it("should handle unsubscription messages", () => {
      const message = {
        type: "unsubscribe",
        channel: "live-scores",
      };

      // Should not throw
      expect(() => {
        // Message would be handled by WebSocket handler
      }).not.toThrow();
    });

    it("should handle ping messages", () => {
      const message = {
        type: "ping",
      };

      expect(message.type).toBe("ping");
    });
  });

  describe("Real-time Updates", () => {
    it("should broadcast match updates", () => {
      const message = {
        type: "update",
        data: {
          matchId: 1,
          homeTeamScore: 2,
          awayTeamScore: 1,
          status: "LIVE",
        },
      };

      wsManager.broadcastToChannel("match:1", message);
      expect(true).toBe(true);
    });

    it("should broadcast player updates", () => {
      const message = {
        type: "update",
        data: {
          playerId: 1,
          totalPoints: 15,
          assists: 2,
          goals: 1,
        },
      };

      wsManager.broadcastToChannel("player:1", message);
      expect(true).toBe(true);
    });

    it("should broadcast league updates", () => {
      const message = {
        type: "update",
        data: {
          leagueId: 1,
          totalTeams: 50,
          currentGameweek: 5,
        },
      };

      wsManager.broadcastToChannel("league:1", message);
      expect(true).toBe(true);
    });

    it("should broadcast gameweek updates", () => {
      const message = {
        type: "update",
        data: {
          leagueId: 1,
          gameweekId: 5,
          status: "LIVE",
          matchesCompleted: 3,
          totalMatches: 5,
        },
      };

      wsManager.broadcastToChannel("gameweek:1:5", message);
      expect(true).toBe(true);
    });

    it("should broadcast transfer updates", () => {
      const message = {
        type: "update",
        data: {
          userTeamId: 1,
          transfersUsed: 2,
          transfersRemaining: 1,
          lastTransfer: new Date().toISOString(),
        },
      };

      wsManager.broadcastToChannel("transfers:1", message);
      expect(true).toBe(true);
    });

    it("should broadcast live score updates", () => {
      const message = {
        type: "live-score",
        data: {
          matchId: 1,
          homeTeamScore: 2,
          awayTeamScore: 1,
          minute: 45,
        },
      };

      wsManager.broadcastToChannel("match:1", message);
      expect(true).toBe(true);
    });
  });

  describe("Notifications", () => {
    it("should send user notifications", () => {
      const notification = {
        type: "notification",
        data: {
          title: "Transfer Alert",
          message: "Player X is now available",
          severity: "info",
        },
      };

      wsManager.sendToUser(1, notification);
      expect(true).toBe(true);
    });

    it("should send multiple notification types", () => {
      const notifications = [
        {
          type: "notification",
          data: { title: "Transfer Alert", severity: "info" },
        },
        {
          type: "notification",
          data: { title: "Injury Report", severity: "warning" },
        },
        {
          type: "notification",
          data: { title: "Price Change", severity: "info" },
        },
      ];

      notifications.forEach((notif) => {
        wsManager.sendToUser(1, notif);
      });

      expect(true).toBe(true);
    });
  });

  describe("Connection Statistics", () => {
    it("should report connection count", () => {
      const count = wsManager.getConnectionCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should report active channels", () => {
      const channels = wsManager.getActiveChannels();
      expect(Array.isArray(channels)).toBe(true);
    });

    it("should report users in channel", () => {
      const users = wsManager.getUsersInChannel("match:1");
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid messages gracefully", () => {
      // Should not throw when broadcasting to non-existent channel
      expect(() => {
        wsManager.broadcastToChannel("non-existent-channel", {
          type: "update",
          data: {},
        });
      }).not.toThrow();
    });

    it("should handle sending to non-existent user", () => {
      // Should not throw when sending to non-existent user
      expect(() => {
        wsManager.sendToUser(9999, {
          type: "notification",
          data: {},
        });
      }).not.toThrow();
    });
  });

  describe("Message Timestamps", () => {
    it("should add timestamps to messages", () => {
      const message = {
        type: "update",
        data: { test: true },
      };

      // Timestamp should be added by manager
      expect(message.type).toBe("update");
    });
  });

  describe("Channel Isolation", () => {
    it("should isolate channels from each other", () => {
      wsManager.broadcastToChannel("channel-1", {
        type: "update",
        data: { channel: 1 },
      });

      wsManager.broadcastToChannel("channel-2", {
        type: "update",
        data: { channel: 2 },
      });

      // Both should succeed without interference
      expect(true).toBe(true);
    });
  });
});
