import { Body, Controller, Get, Headers, Put, Query, Redirect, Req, UseGuards } from "@nestjs/common";
import { EmailsService } from "./email.service";
import { ResponseData } from "src/global/globalClass";
import { EmailsEntity } from "../entities/emails.entity";
import { DataEmailModels, EmailsModel } from "../models/emails.model";
import { UpdateEmailDto } from "../dto/updateemail.dto";
import { EmailsStatisticsModel } from "../models/emailsstatistic.model";
import { AuthGuard } from "../auth/auth.guard";
import { Request } from 'express';
import { DataVerifyEmailModel } from "../models/verifyemail.model";
import { VerifyEmailService } from "./verifyemail.service";

@Controller('emails')
@UseGuards(AuthGuard)
export class EmailsController {
    constructor(
        private readonly emailsService: EmailsService,
        private readonly verifyEmailService: VerifyEmailService
    ) { }

    @Get('all-emails')
    async getAllEmails(
        @Req() req: Request,
        @Query('rows') rows: string,
        @Query('page') page: string,
    ) {
        try {
            const userData = req.user
            const rowsInt = Number(rows);
            const pageInt = Number(page);
            const data = await this.emailsService.getAllEmails(userData.username, rowsInt, pageInt)
            if (data !== null) {
                return new ResponseData<DataEmailModels>(data, 200, "Success")
            } else {
                return new ResponseData<DataEmailModels>([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<DataEmailModels>([], 500, "Internal Server Error")
        }
    }

    @Get('all-emails-user')

    async getAllEmailsByUser(
        @Req() req: Request,
        @Query('viewer') viewer: string,
        @Query('rows') rows: string,
        @Query('page') page: string,
    ) {
        try {
            const userData = req.user
            let user_name = userData.username
            if (viewer !== 'null') {
                user_name = viewer
            }
            const rowsInt = Number(rows);
            const pageInt = Number(page);
            const data = await this.emailsService.getAllEmailsByUser(user_name, rowsInt, pageInt)
            if (data !== null) {
                return new ResponseData<DataEmailModels>(data, 200, "Success")
            } else {
                return new ResponseData<DataEmailModels>([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<DataEmailModels>([], 500, "Internal Server Error")
        }
    }

    @Get('emails-doing')

    async getEmailsDoingByUser(
        @Req() req: Request,
        @Query('viewer') viewer: string,
    ) {
        try {
            const userData = req.user
            let data: EmailsEntity[] = []
            if (viewer !== 'null') {
                console.log(viewer)
                data = await this.emailsService.getEmailsDoingByViewer(viewer)
            } else {
                data = await this.emailsService.getEmailsDoingByUser(userData.username)
            }

            if (data !== null) {
                return new ResponseData<EmailsModel>(data, 200, "Success")
            } else {
                return new ResponseData<EmailsModel>([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<EmailsModel>([], 500, "Internal Server Error")
        }
    }

    @Put('update-email')

    async updateEmailById(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
        try {
            const userData = req.user
            const data = await this.emailsService.updateEmailById(
                userData.username,
                updateEmailDto.action_type,
                updateEmailDto.id,
                updateEmailDto.domain,
                updateEmailDto.name_domain,
                updateEmailDto.note
            );

            if (data !== null) {
                return new ResponseData<DataVerifyEmailModel>(data, 200, "Success")
            } else {
                return new ResponseData<DataVerifyEmailModel>([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<DataVerifyEmailModel>([], 500, "Internal Server Error")
        }
    }

    @Get('emails-statistics')
    async getEmailsStatistics(
        @Req() req: Request,
        @Query('role') role: string,
        @Query('viewer') viewer: string,
        @Query('type_date') type_date: string,
        @Query('start_date') start_date: string,
        @Query('end_date') end_date: string,

    ) {
        try {
            const userData = req.user
            const data = await this.emailsService.getEmailsStatistics(userData.username, role, viewer, type_date, start_date, end_date);
            if (data !== null) {
                return new ResponseData<EmailsStatisticsModel>(data, 200, "Success")
            } else {
                return new ResponseData<EmailsStatisticsModel>([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<EmailsStatisticsModel>([], 500, "Internal Server Error")
        }
    }

    @Get('test-schedule')
    async testScheduler(@Req() req: Request) {
        try {
            const data = await this.verifyEmailService.getEmailByInAnywhere('e3sparkplugs')
            return new ResponseData<any>(data, 200, "Success")
        } catch (error) {
            console.log(error)
        }

    }

}