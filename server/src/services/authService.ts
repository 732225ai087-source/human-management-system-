import { randomUUID } from 'crypto';
import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendVerificationEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorHandler.js';
import type { SignUpInput, SignInInput } from '../validators/authValidator.js';
import type { Role } from '@prisma/client';

export class AuthService {
  async signup(data: SignUpInput) {
    // Check for existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Generate unique employee ID based on current employee strength (user count + 1)
    const count = await prisma.user.count();
    let idNumber = count + 1;
    let employeeId = `EMP-${String(idNumber).padStart(3, '0')}`;

    // Ensure uniqueness in case of legacy or manually entered IDs
    let exists = await prisma.user.findUnique({ where: { employeeId } });
    while (exists) {
      idNumber++;
      employeeId = `EMP-${String(idNumber).padStart(3, '0')}`;
      exists = await prisma.user.findUnique({ where: { employeeId } });
    }

    const hashedPassword = await hashPassword(data.password);
    const emailVerifyToken = randomUUID();

    const user = await prisma.user.create({
      data: {
        employeeId,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        isEmailVerified: process.env.NODE_ENV !== 'production',
        emailVerifyToken,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    await sendVerificationEmail(data.email, emailVerifyToken);

    return user;
  }

  async signin(data: SignInInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
      throw new AppError('Please verify your email before signing in', 403);
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store hashed refresh token
    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Return user without password
    const { password: _, refreshToken: __, emailVerifyToken: ___, ...safeUser } = user;

    return {
      user: safeUser,
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const isValid = await comparePassword(token, user.refreshToken);
      if (!isValid) {
        throw new AppError('Invalid refresh token', 401);
      }

      const newPayload = { userId: user.id, role: user.role };
      const accessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      const hashedRefreshToken = await hashPassword(newRefreshToken);
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification link', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export const authService = new AuthService();
