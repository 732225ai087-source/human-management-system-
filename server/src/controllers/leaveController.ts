import { Request, Response, NextFunction } from 'express';
import { leaveService } from '../services/leaveService.js';
import { notificationService } from '../services/notificationService.js';
import type { ApiResponse } from '../types/index.js';

export class LeaveController {
  async applyLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await leaveService.applyLeave(req.user!.userId, req.body);
      // Notify admins
      await notificationService.notifyAdmins('LEAVE_APPLIED', 'New Leave Request', `A new ${req.body.leaveType} leave request has been submitted.`);
      res.status(201).json({ success: true, data: leave, message: 'Leave request submitted' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getMyLeaves(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leaves = await leaveService.getMyLeaves(req.user!.userId, req.query.status as string);
      res.json({ success: true, data: leaves } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getLeaveById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await leaveService.getLeaveById(req.params.id as string, req.user!.userId, req.user!.role);
      res.json({ success: true, data: leave } as ApiResponse);
    } catch (error) { next(error); }
  }

  async approveLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await leaveService.approveLeave(req.params.id as string, req.user!.userId, req.body.remarks);
      await notificationService.createNotification(leave.userId, 'LEAVE_APPROVED', 'Leave Approved', `Your ${leave.leaveType} leave request has been approved.`);
      res.json({ success: true, data: leave, message: 'Leave approved' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async rejectLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leave = await leaveService.rejectLeave(req.params.id as string, req.user!.userId, req.body.remarks);
      await notificationService.createNotification(leave.userId, 'LEAVE_REJECTED', 'Leave Rejected', `Your ${leave.leaveType} leave request has been rejected.${req.body.remarks ? ` Reason: ${req.body.remarks}` : ''}`);
      res.json({ success: true, data: leave, message: 'Leave rejected' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getAllLeaves(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leaveService.getAllLeaves({
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });
      res.json({ success: true, data: result } as ApiResponse);
    } catch (error) { next(error); }
  }
}

export const leaveController = new LeaveController();
