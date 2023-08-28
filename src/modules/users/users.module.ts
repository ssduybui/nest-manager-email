import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthModule } from "../auth/auth.module";
import { GmailProfileEntity } from "../entities/gmail_profile.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, GmailProfileEntity]),
        AuthModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
})

export class UsersModule {}