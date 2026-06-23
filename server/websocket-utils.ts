/**
 * WebSocket utility functions for broadcasting real-time updates
 * These functions are used in tRPC procedures to send updates to connected clients
 */

import type { WebSocketManager } from "./_core/websocket";

/**
 * Get the WebSocket manager instance
 */
export function getWSManager(): WebSocketManager | null {
  return (global as any).wsManager || null;
}

/**
 * Broadcast a match update to all clients
 */
export function broadcastMatchUpdate(matchId: number, data: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  wsManager.broadcastToChannel(`match:${matchId}`, {
    type: "update",
    data: {
      matchId,
      ...data,
    },
  });
}

/**
 * Broadcast a player performance update
 */
export function broadcastPlayerUpdate(playerId: number, data: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  wsManager.broadcastToChannel(`player:${playerId}`, {
    type: "update",
    data: {
      playerId,
      ...data,
    },
  });
}

/**
 * Broadcast a league update
 */
export function broadcastLeagueUpdate(leagueId: number, data: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  wsManager.broadcastToChannel(`league:${leagueId}`, {
    type: "update",
    data: {
      leagueId,
      ...data,
    },
  });
}

/**
 * Send a notification to a specific user
 */
export function notifyUser(userId: number, notification: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  wsManager.sendToUser(userId, {
    type: "notification",
    data: notification,
  });
}

/**
 * Broadcast a gameweek update
 */
export function broadcastGameweekUpdate(leagueId: number, gameweekId: number, data: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  wsManager.broadcastToChannel(`gameweek:${leagueId}:${gameweekId}`, {
    type: "update",
    data: {
      leagueId,
      gameweekId,
      ...data,
    },
  });
}

/**
 * Broadcast a transfer update
 */
export function broadcastTransferUpdate(userTeamId: number, data: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  wsManager.broadcastToChannel(`transfers:${userTeamId}`, {
    type: "update",
    data: {
      userTeamId,
      ...data,
    },
  });
}

/**
 * Broadcast a live score update
 */
export function broadcastLiveScore(matchId: number, score: any) {
  const wsManager = getWSManager();
  if (!wsManager) return;

  // Broadcast to match channel
  wsManager.broadcastToChannel(`match:${matchId}`, {
    type: "live-score",
    data: {
      matchId,
      score,
    },
  });

  // Also broadcast to all clients watching live scores
  wsManager.broadcastToChannel("live-scores", {
    type: "live-score",
    data: {
      matchId,
      score,
    },
  });
}

/**
 * Get connection statistics
 */
export function getConnectionStats() {
  const wsManager = getWSManager();
  if (!wsManager) {
    return {
      totalConnections: 0,
      activeChannels: [],
    };
  }

  return {
    totalConnections: wsManager.getConnectionCount(),
    activeChannels: wsManager.getActiveChannels(),
  };
}

export default {
  getWSManager,
  broadcastMatchUpdate,
  broadcastPlayerUpdate,
  broadcastLeagueUpdate,
  notifyUser,
  broadcastGameweekUpdate,
  broadcastTransferUpdate,
  broadcastLiveScore,
  getConnectionStats,
};
