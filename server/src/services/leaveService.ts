import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class LeaveService {
  async applyLeave(userId: string, data: { leaveType: string; startDate: string; endDate: string; reason?: string }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) throw new AppError('Cannot apply for leave in the past', 400);
    if (end < start) throw new AppError('End date must be after start date', 400);

    // Check for overlapping approved/pending leaves
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    if (overlapping) throw new AppError('You already have a leave request for this period', 400);

    return prisma.leaveRequest.create({
      data: {
        userId,
        leaveType: data.leaveType as 'PAID' | 'SICK' | 'UNPAID',
        startDate: start,
        endDate: end,
        reason: data.reason,
      },
    });
  }

  async getMyLeaves(userId: string, status?: string) {
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    return prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeaveById(id: string, userId: string, role: string) {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, employeeId: true, email: true, profile: { select: { firstName: true, lastName: true } } } } },
    });
    if (!leave) throw new AppError('Leave request not found', 404);
    if (role !== 'ADMIN' && leave.userId !== userId) {
      throw new AppError('Not authorized', 403);
    }
    return leave;
  }

  async approveLeave(leaveId: string, adminId: string, remarks?: string) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.status !== 'PENDING') throw new AppError('Only pending leaves can be approved', 400);

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED', adminRemarks: remarks, reviewedBy: adminId, reviewedAt: new Date() },
    });

    // Create ON_LEAVE attendance records for each day in the range
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const attendanceData = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        attendanceData.push({
          userId: leave.userId,
          date: new Date(d),
          status: 'ON_LEAVE' as const,
        });
      }
    }

    if (attendanceData.length > 0) {
      await prisma.attendance.createMany({ data: attendanceData, skipDuplicates: true });
    }

    return updated;
  }

  async rejectLeave(leaveId: string, adminId: string, remarks?: string) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.status !== 'PENDING') throw new AppError('Only pending leaves can be rejected', 400);

    return prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'REJECTED', adminRemarks: remarks, reviewedBy: adminId, reviewedAt: new Date() },
    });
  }

  async getAllLeaves(filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: { user: { select: { id: true, employeeId: true, email: true, profile: { select: { firstName: true, lastName: true } } } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const leaveService = new LeaveService();
