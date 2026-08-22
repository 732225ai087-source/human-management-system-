import { prisma } from '../config/database.js';

export class ReportService {
  async getAttendanceReport(startDate: string, endDate: string) {
    const records = await prisma.attendance.findMany({
      where: { date: { gte: new Date(startDate), lte: new Date(endDate) } },
      include: { user: { select: { employeeId: true, profile: { select: { firstName: true, lastName: true } } } } },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const halfDay = records.filter((r) => r.status === 'HALF_DAY').length;
    const onLeave = records.filter((r) => r.status === 'ON_LEAVE').length;

    return {
      summary: { total, present, absent, halfDay, onLeave, attendanceRate: total > 0 ? ((present + halfDay) / total * 100).toFixed(1) : '0' },
      records,
    };
  }

  async getLeaveReport(startDate: string, endDate: string) {
    const leaves = await prisma.leaveRequest.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      include: { user: { select: { employeeId: true, profile: { select: { firstName: true, lastName: true } } } } },
    });

    const total = leaves.length;
    const approved = leaves.filter((l) => l.status === 'APPROVED').length;
    const rejected = leaves.filter((l) => l.status === 'REJECTED').length;
    const pending = leaves.filter((l) => l.status === 'PENDING').length;

    const byType = { PAID: 0, SICK: 0, UNPAID: 0 };
    leaves.forEach((l) => { byType[l.leaveType]++; });

    return { summary: { total, approved, rejected, pending, byType }, leaves };
  }

  generateCSV(headers: string[], rows: string[][]): string {
    const csvHeaders = headers.join(',');
    const csvRows = rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  }

  async getAttendanceCSV(startDate: string, endDate: string) {
    const { records } = await this.getAttendanceReport(startDate, endDate);
    const headers = ['Date', 'Employee ID', 'Name', 'Check In', 'Check Out', 'Status'];
    const rows = records.map((r) => [
      new Date(r.date).toLocaleDateString(),
      r.user.employeeId,
      `${r.user.profile?.firstName || ''} ${r.user.profile?.lastName || ''}`,
      r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : 'N/A',
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A',
      r.status,
    ]);
    return this.generateCSV(headers, rows);
  }
}

export const reportService = new ReportService();
