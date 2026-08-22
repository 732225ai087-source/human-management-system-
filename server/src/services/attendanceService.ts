import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class AttendanceService {
  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing?.checkIn) {
      throw new AppError('You have already checked in today', 400);
    }

    if (existing) {
      return prisma.attendance.update({
        where: { id: existing.id },
        data: { checkIn: new Date(), status: 'PRESENT' },
      });
    }

    return prisma.attendance.create({
      data: { userId, date: today, checkIn: new Date(), status: 'PRESENT' },
    });
  }

  async checkOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!attendance || !attendance.checkIn) {
      throw new AppError('You must check in before checking out', 400);
    }
    if (attendance.checkOut) {
      throw new AppError('You have already checked out today', 400);
    }

    const checkOutTime = new Date();
    const hoursWorked = (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
    const status = hoursWorked < 4 ? 'HALF_DAY' : 'PRESENT';

    return prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: checkOutTime, status },
    });
  }

  async getTodayStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
  }

  async getMyAttendance(userId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = { userId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    }
    return prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getAllAttendance(filters: { userId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { userId, startDate, endDate, page = 1, limit = 20 } = filters;
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { user: { select: { id: true, employeeId: true, email: true, profile: { select: { firstName: true, lastName: true } } } } },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAbsentForDate(date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const checkedIn = await prisma.attendance.findMany({
      where: { date: dayStart },
      select: { userId: true },
    });
    const checkedInIds = new Set(checkedIn.map((a) => a.userId));

    const absentUsers = allUsers.filter((u) => !checkedInIds.has(u.id));

    if (absentUsers.length > 0) {
      await prisma.attendance.createMany({
        data: absentUsers.map((u) => ({
          userId: u.id,
          date: dayStart,
          status: 'ABSENT' as const,
        })),
        skipDuplicates: true,
      });
    }

    return { marked: absentUsers.length };
  }
}

export const attendanceService = new AttendanceService();
