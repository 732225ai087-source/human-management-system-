import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profileService.js';
import type { ApiResponse } from '../types/index.js';

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.userId;
      // Non-admin can only see their own profile
      if (req.user!.role !== 'ADMIN' && userId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Not authorized' });
        return;
      }
      const profile = await profileService.getProfile(userId);
      res.json({ success: true, data: profile } as ApiResponse);
    } catch (error) { next(error); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.userId;
      if (req.user!.role !== 'ADMIN' && userId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Not authorized' });
        return;
      }
      const profile = await profileService.updateProfile(userId, req.body, req.user!.role);
      res.json({ success: true, data: profile, message: 'Profile updated' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async uploadProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
      const userId = req.params.userId || req.user!.userId;
      const fileUrl = `/uploads/profiles/${req.file.filename}`;
      const profile = await profileService.updateProfilePicture(userId, fileUrl);
      res.json({ success: true, data: profile, message: 'Profile picture updated' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
      const userId = req.params.userId || req.user!.userId;
      const fileUrl = `/uploads/documents/${req.file.filename}`;
      const doc = await profileService.uploadDocument(userId, req.file.originalname, fileUrl, req.file.mimetype);
      res.status(201).json({ success: true, data: doc, message: 'Document uploaded' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await profileService.deleteDocument(req.params.id, req.user!.userId, req.user!.role);
      res.json({ success: true, message: 'Document deleted' } as ApiResponse);
    } catch (error) { next(error); }
  }

  async getAllProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const result = await profileService.getAllProfiles(page, limit, search);
      res.json({ success: true, data: result } as ApiResponse);
    } catch (error) { next(error); }
  }
}

export const profileController = new ProfileController();
