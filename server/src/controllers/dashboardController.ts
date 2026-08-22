import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import type { ApiResponse } from '../types/index.js';

export class DashboardController {
  async getEmployeeDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getEmployeeDashboard(req.user!.userId);
      res.json({ success: true, data } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getAdminDashboard();
      res.json({ success: true, data } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getEmployeeList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const data = await dashboardService.getEmployeeList(page, limit, search);
      res.json({ success: true, data } as ApiResponse);
    } catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
