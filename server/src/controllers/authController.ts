import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import type { ApiResponse } from '../types/index.js';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.signup(req.body);
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Account created successfully. Please check your email to verify your account.',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.signin(req.body);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: {
            accessToken: result.tokens.accessToken,
          },
        },
        message: 'Signed in successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'No refresh token provided',
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        data: { accessToken: tokens.accessToken },
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const result = await authService.verifyEmail(token);
      const response: ApiResponse = {
        success: true,
        message: result.message,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }

      res.clearCookie('refreshToken', { path: '/' });

      const response: ApiResponse = {
        success: true,
        message: 'Signed out successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: user,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
