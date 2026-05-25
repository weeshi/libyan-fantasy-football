/**
 * Live Updates & Notifications System for Talba Fantasy Football
 * Handles real-time notifications and updates
 */

import { getDb } from "./db";

/**
 * Notification types
 */
export type NotificationType =
  | "match_start"
  | "match_end"
  | "goal_scored"
  | "player_injury"
  | "team_update"
  | "league_update"
  | "transfer_window_closing"
  | "gameweek_start"
  | "gameweek_end"
  | "chip_reminder"
  | "h2h_result"
  | "cup_result"
  | "achievement_unlocked";

/**
 * Notification priority levels
 */
export type NotificationPriority = "low" | "medium" | "high" | "critical";

/**
 * Notification interface
 */
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Create notifications table if not exists
 */
export async function createNotificationsTableIfNotExists(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        data JSON,
        isRead INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiresAt TIMESTAMP NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        INDEX idx_user_read (userId, isRead),
        INDEX idx_created (createdAt)
      )
    `);

    return true;
  } catch (error) {
    console.error("Failed to create notifications table:", error);
    return false;
  }
}

/**
 * Send notification to user
 */
export async function sendNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = "medium",
  data: Record<string, any> = {},
  expiresIn?: number
): Promise<{ success: boolean; notificationId?: number }> {
  const db = await getDb();
  if (!db) {
    return { success: false };
  }

  try {
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn);
    }

    const result = await db.execute(`
      INSERT INTO notifications (userId, type, title, message, priority, data, expiresAt)
      VALUES (
        ${userId},
        '${type}',
        '${title.replace(/'/g, "\\'")}'',
        '${message.replace(/'/g, "\\'")}'',
        '${priority}',
        '${JSON.stringify(data).replace(/'/g, "\\'")}'',
        ${expiresAt ? `'${expiresAt.toISOString()}'` : "NULL"}
      )
    `);

    const insertResult = result as any;
    return { success: true, notificationId: insertResult.insertId || 0 };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false };
  }
}

/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const notifications = await db.execute(`
      SELECT * FROM notifications
      WHERE userId = ${userId} AND isRead = 0
      ORDER BY priority DESC, createdAt DESC
      LIMIT ${limit}
    `);

    return notifications;
  } catch (error) {
    console.error("Failed to get unread notifications:", error);
    return [];
  }
}

/**
 * Get all notifications for user
 */
export async function getAllNotifications(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    const notifications = await db.execute(`
      SELECT * FROM notifications
      WHERE userId = ${userId}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    return notifications;
  } catch (error) {
    console.error("Failed to get all notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(`
      UPDATE notifications
      SET isRead = 1
      WHERE id = ${notificationId}
    `);

    return true;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(`
      UPDATE notifications
      SET isRead = 1
      WHERE userId = ${userId} AND isRead = 0
    `);

    return true;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(`
      DELETE FROM notifications
      WHERE id = ${notificationId}
    `);

    return true;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return false;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.execute(`
      SELECT COUNT(*) as count FROM notifications
      WHERE userId = ${userId} AND isRead = 0
    `);

    const countResult = (result as any[])[0];
    return countResult?.count || 0;
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
}

/**
 * Send match start notification
 */
export async function sendMatchStartNotification(
  userId: number,
  team1Name: string,
  team2Name: string,
  matchId: number
): Promise<{ success: boolean }> {
  return sendNotification(
    userId,
    "match_start",
    "بدء المباراة",
    `${team1Name} ضد ${team2Name} - المباراة بدأت الآن`,
    "high",
    { matchId, team1Name, team2Name }
  );
}

/**
 * Send goal scored notification
 */
export async function sendGoalScoredNotification(
  userId: number,
  playerName: string,
  teamName: string,
  score: string,
  matchId: number
): Promise<{ success: boolean }> {
  return sendNotification(
    userId,
    "goal_scored",
    "هدف!",
    `${playerName} (${teamName}) سجل هدفاً - النتيجة: ${score}`,
    "high",
    { matchId, playerName, teamName, score }
  );
}

/**
 * Send transfer window closing notification
 */
export async function sendTransferWindowClosingNotification(
  userId: number,
  hoursRemaining: number
): Promise<{ success: boolean }> {
  return sendNotification(
    userId,
    "transfer_window_closing",
    "نافذة الانتقالات تغلق قريباً",
    `متبقي ${hoursRemaining} ساعة على إغلاق نافذة الانتقالات`,
    "high",
    { hoursRemaining }
  );
}

/**
 * Send gameweek start notification
 */
export async function sendGameweekStartNotification(
  userId: number,
  gameweekNumber: number
): Promise<{ success: boolean }> {
  return sendNotification(
    userId,
    "gameweek_start",
    `بدء الأسبوع ${gameweekNumber}`,
    `الأسبوع ${gameweekNumber} بدأ الآن - تحقق من فريقك`,
    "medium",
    { gameweekNumber }
  );
}

/**
 * Send chip reminder notification
 */
export async function sendChipReminderNotification(
  userId: number,
  chipName: string
): Promise<{ success: boolean }> {
  return sendNotification(
    userId,
    "chip_reminder",
    "تذكير: لديك رقاقة متاحة",
    `الرقاقة "${chipName}" متاحة للاستخدام هذا الأسبوع`,
    "medium",
    { chipName }
  );
}

/**
 * Send H2H result notification
 */
export async function sendH2HResultNotification(
  userId: number,
  opponentName: string,
  userPoints: number,
  opponentPoints: number,
  result: "win" | "draw" | "loss"
): Promise<{ success: boolean }> {
  const resultText = result === "win" ? "فزت" : result === "draw" ? "تعادل" : "خسرت";
  const title = `نتيجة Head-to-Head: ${resultText}`;
  const message = `${resultText} ضد ${opponentName} (${userPoints} - ${opponentPoints})`;

  return sendNotification(userId, "h2h_result", title, message, "medium", {
    opponentName,
    userPoints,
    opponentPoints,
    result,
  });
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  userId: number,
  achievementName: string,
  description: string
): Promise<{ success: boolean }> {
  return sendNotification(
    userId,
    "achievement_unlocked",
    `إنجاز: ${achievementName}`,
    description,
    "high",
    { achievementName, description }
  );
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.execute(`
      DELETE FROM notifications
      WHERE expiresAt IS NOT NULL AND expiresAt < NOW()
    `);

    const deleteResult = result as any;
    return deleteResult.affectedRows || 0;
  } catch (error) {
    console.error("Failed to cleanup expired notifications:", error);
    return 0;
  }
}

/**
 * Get notification statistics for user
 */
export async function getNotificationStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN isRead = 0 THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high
      FROM notifications
      WHERE userId = ${userId}
    `);

    return stats[0] || null;
  } catch (error) {
    console.error("Failed to get notification stats:", error);
    return null;
  }
}
