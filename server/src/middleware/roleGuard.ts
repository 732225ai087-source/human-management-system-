import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types/index.js';

export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'You do not have permission to access this resource',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
}
