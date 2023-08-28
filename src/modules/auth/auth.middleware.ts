// auth.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service'; // Thay thế bằng service xác thực của bạn

interface DecodedUser {
  username: string; // Thay đổi dựa trên thông tin người dùng của bạn
  // Các thông tin khác về người dùng
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header

    if (token) {
      try {
        const decoded = await this.authService.verifyToken(token) as DecodedUser;
        req.user = decoded; // Lưu thông tin người dùng vào request
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
