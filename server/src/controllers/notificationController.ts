import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService.js';
import type { ApiResponse } from '../types/index.js';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.getNotifications(req.user!.userId, page, limit);
      res.json({ success: true, data: result } as ApiResponse);
    } catch (error) { next(error); }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Notification marked as read' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, message: 'All notifications marked as read' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      res.json({ success: true, data: { count } } as ApiResponse);
    } catch (error) { next(error); }
  }
}

export const notificationController = new NotificationController();
