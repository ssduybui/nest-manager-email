import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailsEntity } from "../entities/emails.entity";
import { EmailsController } from "./emails.controller";
import { EmailsService } from "./email.service";
import { AuthModule } from "../auth/auth.module";
import { VerifyEmailService } from "./verifyemail.service";
import { GmailProfileEntity } from "../entities/gmail_profile.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([EmailsEntity, GmailProfileEntity]),
        AuthModule
    ],
    controllers: [EmailsController],
    providers: [EmailsService, VerifyEmailService],
})

export class EmailsModule {}