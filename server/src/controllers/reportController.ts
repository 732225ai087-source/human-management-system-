import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService.js';
import type { ApiResponse } from '../types/index.js';

export class ReportController {
  async getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, error: 'startDate and endDate are required' });
        return;
      }
      const report = await reportService.getAttendanceReport(startDate as string, endDate as string);
      res.json({ success: true, data: report } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getLeaveReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, error: 'startDate and endDate are required' });
        return;
      }
      const report = await reportService.getLeaveReport(startDate as string, endDate as string);
      res.json({ success: true, data: report } as ApiResponse);
    } catch (error) { next(error); }
  }

  async exportAttendanceCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, error: 'startDate and endDate are required' });
        return;
      }
      const csv = await reportService.getAttendanceCSV(startDate as string, endDate as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      res.send(csv);
    } catch (error) { next(error); }
  }
}

export const reportController = new ReportController();
