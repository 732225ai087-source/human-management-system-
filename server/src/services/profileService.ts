import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class ProfileService {
  async getProfile(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { documents: true, user: { select: { id: true, employeeId: true, email: true, role: true } } },
    });
    if (!profile) throw new AppError('Profile not found', 404);
    return profile;
  }

  async updateProfile(userId: string, data: Record<string, unknown>, role: string) {
    const allowedEmployeeFields = ['phone', 'address'];
    const allowedAdminFields = ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'department', 'designation', 'dateOfJoining'];

    const allowed = role === 'ADMIN' ? allowedAdminFields : allowedEmployeeFields;
    const filtered: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) filtered[key] = data[key];
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: filtered,
      include: { documents: true },
    });
    return profile;
  }

  async updateProfilePicture(userId: string, fileUrl: string) {
    return prisma.profile.update({
      where: { userId },
      data: { profilePicUrl: fileUrl },
    });
  }

  async uploadDocument(userId: string, name: string, fileUrl: string, fileType: string) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new AppError('Profile not found', 404);

    return prisma.document.create({
      data: { profileId: profile.id, name, fileUrl, fileType },
    });
  }

  async deleteDocument(docId: string, userId: string, role: string) {
    const doc = await prisma.document.findUnique({
      where: { id: docId },
      include: { profile: true },
    });
    if (!doc) throw new AppError('Document not found', 404);
    if (role !== 'ADMIN' && doc.profile.userId !== userId) {
      throw new AppError('Not authorized to delete this document', 403);
    }
    return prisma.document.delete({ where: { id: docId } });
  }

  async getAllProfiles(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { user: { employeeId: { contains: search, mode: 'insensitive' as const } } },
      ],
    } : {};

    const [items, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: { user: { select: { id: true, employeeId: true, email: true, role: true } } },
        skip,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.profile.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const profileService = new ProfileService();
