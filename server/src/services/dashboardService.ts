import { prisma } from '../config/database.js';

export class DashboardService {
  async getEmployeeDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayAttendance, pendingLeaves, recentAttendance, unreadNotifications] = await Promise.all([
      prisma.attendance.findUnique({ where: { userId_date: { userId, date: today } } }),
      prisma.leaveRequest.count({ where: { userId, status: 'PENDING' } }),
      prisma.attendance.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 7 }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      todayAttendance,
      pendingLeaves,
      recentAttendance,
      unreadNotifications,
    };
  }

  async getAdminDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEmployees, presentToday, pendingLeaves, totalPayroll] = await Promise.all([
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.attendance.count({ where: { date: today, status: { in: ['PRESENT', 'HALF_DAY'] } } }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.payroll.aggregate({ _sum: { netSalary: true }, where: { year: today.getFullYear(), month: today.getMonth() + 1 } }),
    ]);

    return {
      totalEmployees,
      presentToday,
      pendingLeaves,
      totalPayroll: totalPayroll._sum.netSalary || 0,
    };
  }

  async getEmployeeList(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { profile: { firstName: { contains: search, mode: 'insensitive' as const } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' as const } } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { employeeId: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, employeeId: true, email: true, role: true, profile: { select: { firstName: true, lastName: true, department: true, designation: true, profilePicUrl: true } } },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const dashboardService = new DashboardService();
