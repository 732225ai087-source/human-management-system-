import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import PDFDocument from 'pdfkit';

export class PayrollService {
  async getMyPayroll(userId: string, month?: number, year?: number) {
    const where: Record<string, unknown> = { userId };
    if (month) where.month = month;
    if (year) where.year = year;
    return prisma.payroll.findMany({ where, orderBy: [{ year: 'desc' }, { month: 'desc' }] });
  }

  async getAllPayroll(filters: { userId?: string; month?: number; year?: number; page?: number; limit?: number }) {
    const { userId, month, year, page = 1, limit = 20 } = filters;
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (month) where.month = month;
    if (year) where.year = year;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: { user: { select: { id: true, employeeId: true, email: true, profile: { select: { firstName: true, lastName: true, department: true, designation: true } } } } },
        skip, take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.payroll.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateSalaryStructure(userId: string, data: { basicSalary: number; hra: number; allowances: number; deductions: number }) {
    return prisma.salaryStructure.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async getSalaryStructure(userId: string) {
    return prisma.salaryStructure.findUnique({ where: { userId } });
  }

  async generatePayroll(month: number, year: number) {
    const structures = await prisma.salaryStructure.findMany();
    if (structures.length === 0) throw new AppError('No salary structures found', 400);

    const records = structures.map((s) => ({
      userId: s.userId,
      month, year,
      basicSalary: s.basicSalary,
      hra: s.hra,
      allowances: s.allowances,
      deductions: s.deductions,
      netSalary: s.basicSalary + s.hra + s.allowances - s.deductions,
    }));

    const result = await prisma.payroll.createMany({ data: records, skipDuplicates: true });
    return { generated: result.count };
  }

  async generateSalarySlipPdf(payrollId: string, userId: string, role: string): Promise<Buffer> {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: { user: { include: { profile: true } } },
    });
    if (!payroll) throw new AppError('Payroll record not found', 404);
    if (role !== 'ADMIN' && payroll.userId !== userId) throw new AppError('Not authorized', 403);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('DAYFLOW', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('HR Management System', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).font('Helvetica-Bold').text('Salary Slip', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`${months[payroll.month - 1]} ${payroll.year}`, { align: 'center' });
      doc.moveDown(2);

      // Employee Details
      doc.fontSize(12).font('Helvetica-Bold').text('Employee Details');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${payroll.user.profile?.firstName || ''} ${payroll.user.profile?.lastName || ''}`);
      doc.text(`Employee ID: ${payroll.user.employeeId}`);
      doc.text(`Department: ${payroll.user.profile?.department || 'N/A'}`);
      doc.text(`Designation: ${payroll.user.profile?.designation || 'N/A'}`);
      doc.moveDown(2);

      // Earnings
      doc.fontSize(12).font('Helvetica-Bold').text('Earnings');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Basic Salary:    ₹${payroll.basicSalary.toLocaleString()}`);
      doc.text(`HRA:             ₹${payroll.hra.toLocaleString()}`);
      doc.text(`Allowances:      ₹${payroll.allowances.toLocaleString()}`);
      doc.moveDown();
      doc.text(`Total Earnings:  ₹${(payroll.basicSalary + payroll.hra + payroll.allowances).toLocaleString()}`);
      doc.moveDown(2);

      // Deductions
      doc.fontSize(12).font('Helvetica-Bold').text('Deductions');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Deductions:      ₹${payroll.deductions.toLocaleString()}`);
      doc.moveDown(2);

      // Net Salary
      doc.fontSize(14).font('Helvetica-Bold').text(`Net Salary: ₹${payroll.netSalary.toLocaleString()}`, { align: 'center' });
      doc.moveDown(3);

      doc.fontSize(8).font('Helvetica').text('This is a computer-generated document and does not require a signature.', { align: 'center' });

      doc.end();
    });
  }
}

export const payrollService = new PayrollService();
