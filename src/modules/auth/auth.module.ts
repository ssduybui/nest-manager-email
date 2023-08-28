import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY || "d3m@c1aPr0",
            signOptions: { expiresIn: '12h' }, // Thời gian hết hạn của token
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthService],
})
export class AuthModule { }