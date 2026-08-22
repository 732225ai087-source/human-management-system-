import { authService } from '../../src/services/authService';
import { prisma } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/utils/hash', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashedPassword')),
}));

jest.mock('../../src/utils/email', () => ({
  sendVerificationEmail: jest.fn(() => Promise.resolve()),
}));

describe('AuthService - Signup employeeId generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should auto-generate correct employeeId starting from count + 1 and padded to 3 digits', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // no existing user with email
      .mockResolvedValueOnce(null); // no existing user with generated EMP-007

    (prisma.user.count as jest.Mock).mockResolvedValue(6);
    
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'uuid-1',
      employeeId: 'EMP-007',
      email: 'test@example.com',
      role: 'EMPLOYEE',
      isEmailVerified: false,
    });

    const result = await authService.signup({
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
    });

    expect(prisma.user.count).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(1, {
      where: { email: 'test@example.com' },
    });
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(2, {
      where: { employeeId: 'EMP-007' },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 'EMP-007',
        }),
      })
    );
    expect(result.employeeId).toBe('EMP-007');
  });

  it('should loop and increment employeeId number if there is a conflict', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // no existing email
      .mockResolvedValueOnce({ id: 'uuid-conflict' }) // EMP-007 already exists!
      .mockResolvedValueOnce(null); // EMP-008 is free!

    (prisma.user.count as jest.Mock).mockResolvedValue(6);

    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'uuid-2',
      employeeId: 'EMP-008',
      email: 'test2@example.com',
      role: 'EMPLOYEE',
      isEmailVerified: false,
    });

    const result = await authService.signup({
      email: 'test2@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'EMPLOYEE',
    });

    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(2, {
      where: { employeeId: 'EMP-007' },
    });
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(3, {
      where: { employeeId: 'EMP-008' },
    });
    expect(result.employeeId).toBe('EMP-008');
  });
});
