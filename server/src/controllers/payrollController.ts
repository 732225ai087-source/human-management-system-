import { Request, Response, NextFunction } from 'express';
import { payrollService } from '../services/payrollService.js';
import type { ApiResponse } from '../types/index.js';

export class PayrollController {
  async getMyPayroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const records = await payrollService.getMyPayroll(req.user!.userId, month, year);
      res.json({ success: true, data: records } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getAllPayroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await payrollService.getAllPayroll({
        userId: req.query.userId as string,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });
      res.json({ success: true, data: result } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getSalaryStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.params.userId as string) || req.user!.userId;
      const structure = await payrollService.getSalaryStructure(userId);
      res.json({ success: true, data: structure } as ApiResponse);
    } catch (error) { next(error); }
  }

  async updateSalaryStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const structure = await payrollService.updateSalaryStructure(req.params.userId as string, req.body);
      res.json({ success: true, data: structure, message: 'Salary structure updated' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async generatePayroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { month, year } = req.body;
      const result = await payrollService.generatePayroll(month, year);
      res.json({ success: true, data: result, message: `Generated ${result.generated} payroll records` } as ApiResponse);
    } catch (error) { next(error); }
  }

  async downloadSlip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const pdfBuffer = await payrollService.generateSalarySlipPdf(id, req.user!.userId, req.user!.role);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=salary-slip-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error) { next(error); }
  }
}

export const payrollController = new PayrollController();
