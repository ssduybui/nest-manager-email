import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionModel } from '../models/session.model';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    async createToken(payload: any): Promise<string> {
        const token = await this.jwtService.signAsync(payload); // Tạo token
        return token; // Tạo token
    }

    async verifyToken(token: string): Promise<any> {
        try {
            const tokendata = token.trim();
            const verifyData = await this.jwtService.verifyAsync(tokendata); // Xác minh token và
            return verifyData; // Xác minh token và trả về dữ liệu giải mã
        } catch (error) {
            return null; // Token không hợp lệ
        }
    }
}