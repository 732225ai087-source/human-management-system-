import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendanceService.js';
import type { ApiResponse } from '../types/index.js';

export class AttendanceController {
  async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendance = await attendanceService.checkIn(req.user!.userId);
      res.json({ success: true, data: attendance, message: 'Checked in successfully' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendance = await attendanceService.checkOut(req.user!.userId);
      res.json({ success: true, data: attendance, message: 'Checked out successfully' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getTodayStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await attendanceService.getTodayStatus(req.user!.userId);
      res.json({ success: true, data: status } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getMyAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const records = await attendanceService.getMyAttendance(
        req.user!.userId,
        startDate as string,
        endDate as string
      );
      res.json({ success: true, data: records } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getAllAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, startDate, endDate, page, limit } = req.query;
      const result = await attendanceService.getAllAttendance({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, data: result } as ApiResponse);
    } catch (error) { next(error); }
  }
}

export const attendanceController = new AttendanceController();
