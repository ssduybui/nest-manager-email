// auth.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service'; // Import your auth service

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        
        const token = request.headers.authorization.split(' ')[1];
        
        if (token) {
            try {
                const decoded = await this.authService.verifyToken(token);
                request.user = decoded;
                return true;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }
}
