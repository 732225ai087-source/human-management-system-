import { prisma } from '../config/database.js';
import { sendNotificationEmail } from '../utils/email.js';
import type { NotificationType } from '@prisma/client';

export class NotificationService {
  async createNotification(userId: string, type: string, title: string, message: string) {
    const notification = await prisma.notification.create({
      data: { userId, type: type as NotificationType, title, message },
    });

    // Also send email notification
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user) {
      await sendNotificationEmail(user.email, title, message);
    }

    return notification;
  }

  async notifyAdmins(type: string, title: string, message: string) {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, email: true } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, type: type as NotificationType, title, message },
      });
      await sendNotificationEmail(admin.email, title, message);
    }
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

export const notificationService = new NotificationService();
