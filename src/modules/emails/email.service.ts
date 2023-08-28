import { Injectable } from "@nestjs/common";
import { EmailsEntity } from "../entities/emails.entity";
import { Between, EntityManager, IsNull, LessThanOrEqual, Not, Repository } from "typeorm";
import { DataEmailModels, EmailsModel } from "../models/emails.model";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "../auth/auth.service";
import { EmailsStatisticsModel } from "../models/emailsstatistic.model";
import { VerifyEmailService } from "./verifyemail.service";
import { DataVerifyEmailModel } from "../models/verifyemail.model";
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()

export class EmailsService {
    constructor(
        @InjectRepository(EmailsEntity)
        private readonly emailsRepository: Repository<EmailsEntity>,
        private readonly verifyEmailsService: VerifyEmailService
    ) {

    }

    async getAllEmails(username: string, rows: number, page: number): Promise<DataEmailModels> {
        if (username) {
            const countEmails = await this.emailsRepository.count({ where: { state: Not(IsNull()) } });
            const data = await this.emailsRepository.find({
                where: { state: Not(IsNull()) },
                order: { updated_at: 'DESC' },
                skip: rows * (page - 1),
                take: rows,
            });

            const result = {
                records: data,
                page: Math.ceil(countEmails / rows)
            }

            return result;
        } else {
            return null;
        }
    }

    async getAllEmailsByUser(username: string, rows: number, page: number): Promise<DataEmailModels> {
        if (username) {
            const countEmails = await this.emailsRepository.count({ where: { employees: username } });
            const data = await this.emailsRepository.find({
                where: {
                    employees: username,
                    state: Not(IsNull())
                },
                order: { updated_at: 'DESC' },
                skip: rows * (page - 1),
                take: rows,
            })

            const result = {
                records: data,
                page: Math.ceil(countEmails / rows)
            }
            return result;
        } else {
            return null;
        }
    }

    async getEmailsDoingByUser(username: string) {
        if (username) {
            const data = await this.emailsRepository.find({
                where: {
                    employees: username,
                    state: IsNull(),

                },
                order: { id: 'ASC' }
            });

            if (data.length < 3) {
                if (data.length === 0) {
                    const data = await this.getNewEmailsDoing(username, 3)
                    return data;
                } else {
                    for (const email of data) {
                        const today = new Date();
                        today.setUTCHours(0, 0, 0, 0);
                        email.updated_at = today > email.updated_at ? new Date() : email.updated_at;
                    }

                    await this.emailsRepository.save(data);
                    return data;
                }
            } else if (data.length === 3) {
                for (const email of data) {
                    const today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    email.updated_at = today > email.updated_at ? new Date() : email.updated_at;
                }

                await this.emailsRepository.save(data);
                return data;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    async getEmailsDoingByViewer(username: string) {
        if (username) {
            const data = await this.emailsRepository.find({
                where: {
                    employees: username,
                    state: IsNull(),
                },
            });
            return data;
        } else {
            return null;
        }
    }

    async getNewEmailsDoing(username: string, numberRecord: number) {
        const result = await this.emailsRepository.manager.transaction(
            async (transactionalEntityManager: EntityManager) => {
                // Lấy 3 bản ghi chưa có nhân viên và cập nhật employees
                const dataNew = await transactionalEntityManager.find(EmailsEntity, {
                    where: {
                        state: IsNull(),
                        employees: IsNull(),
                    },
                    order: { id: 'ASC' },
                    take: numberRecord,
                });

                for (const email of dataNew) {
                    email.employees = username;
                    email.updated_at = new Date();
                }

                // Lưu thay đổi trong transaction
                await transactionalEntityManager.save(dataNew);

                return dataNew;
            },
        );

        return result;
    }

    async getEmailsStatistics(username: string, role: string, viewer: string, type_date: string, start_date: string, end_date: string) {
        if (username) {
            if (type_date === 'Today') {
                return await this.getEmailsTodayByUser(username, role, viewer)
            } else if (type_date === 'Total') {
                return await this.getEmailsTotalByUser(username, role, viewer)
            } else if (type_date === 'Week') {
                return await this.getEmailsThisWeekByUser(username, role, viewer)
            } else if (type_date === 'Month') {
                return await this.getEmailsThisMonthByUser(username, role, viewer)
            } else if (type_date === 'Year') {
                return await this.getEmailsThisYearByUser(username, role, viewer)
            } else if (type_date === 'beetween') {
                return await this.getEmailsBetweenDates(username, role, viewer, start_date, end_date)
            }
        } else {
            return null;
        }
    }

    async getEmailsTodayByUser(username: string, role?: string, viewer?: string) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const startDate = today;
        const endDate = new Date();

        let user_name = username;
        if (viewer) {
            user_name = viewer;
        }
        const data = await this.getEmailsResult(user_name, role, startDate, endDate);
        return data;
    }


    async getEmailsResult(username: string, role: string, startDate?: Date, endDate?: Date, currentDate?: Date) {
        let formattedDate = ''
        if (currentDate) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - 1);
            formattedDate = date.toISOString().slice(0, 10);
        }
        const emailSuccess = await this.countEmailByState(username, role, 'Success', startDate, endDate)
        const emailPending = await this.countEmailByState(username, role, 'Pending', startDate, endDate)
        const emailCancel = await this.countEmailByState(username, role, "Cancel", startDate, endDate)
        const data = {
            emails_success: emailSuccess,
            emails_pending: emailPending,
            emails_cancel: emailCancel,
            emails_total: emailSuccess + emailPending + emailCancel,
            updated_at: formattedDate,
        }
        return data;
    }

    async countEmailByState(username: string, role: string, state: string | null, startDate?: Date, endDate?: Date) {
        let where: Record<string, any> = {};

        if (role === 'manager' || role === 'admin') {
            where.state = state;
        } else if (role === 'partner') {
            where.employees = username;
            where.state = state;
        } else {
            where.employees = username;
            where.state = state;
        }

        if (startDate && endDate) {
            where.updated_at = Between(startDate, endDate);
        }

        if (state === null) {
            where.state = IsNull();
        }

        const data = await this.emailsRepository.count({ where });

        return data;
    }



    async getEmailsTotalByUser(username: string, role?: string, viewer?: string) {
        let user_name = username;
        if (viewer) {
            user_name = viewer;
        }
        const data = await this.getEmailsResult(user_name, role);
        return data;
    }

    async getEmailsThisWeekByUser(username: string, role: string, viewer?: string) {

        let user_name = username;
        if (viewer !== 'undefined') {
            user_name = viewer;
        }
        const today = new Date();
        const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

        const dataArr = [];


        for (let i = 1; i <= today.getDay(); i++) {
            const startDate = new Date(firstDayOfWeek);
            startDate.setDate(startDate.getDate() + i);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            const data = await this.getEmailsResult(user_name, role, startDate, endDate);
            dataArr.push(data);
        }

        if (today.getDay() === 0) {
            today.setUTCHours(0, 0, 0, 0);
            const startDate = today;
            const endDate = new Date();
            const data = await this.getEmailsResult(user_name, role, startDate, endDate);
            dataArr.push(data);
        }

        return dataArr
    }

    async getEmailsThisMonthByUser(username: string, role: string, viewer?: string) {
        let user_name = username;
        if (viewer !== 'undefined') {
            user_name = viewer;
        }
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const dataArr = [];

        for (let d = 1; d <= today.getDate(); d++) {
            const currentDate = new Date(year, month, d);

            if (currentDate <= today) {
                const startDate = new Date(year, month, d);
                const endDate = new Date(year, month, d + 1);
                const data = await this.getEmailsResult(user_name, role, startDate, endDate);
                dataArr.push(data);
            }
        }


        return dataArr;
    }

    async getEmailsThisYearByUser(username: string, role: string, viewer?: string) {
        let user_name = username;
        if (viewer !== 'undefined') {
            user_name = viewer;
        }
        const today = new Date();
        const year = today.getFullYear();
        const currentMonth = today.getMonth();

        const dataArr = [];

        for (let month = 0; month <= currentMonth; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 1);

            const data = await this.getEmailsResult(user_name, role, startDate, endDate);
            dataArr.push(data);
        }
        return dataArr;
    }

    async getEmailsBetweenDates(username: string, role: string, viewer?: string, startDateString?: string, endDateString?: string) {
        let user_name = username;
        if (viewer !== 'undefined') {
            user_name = viewer;
        }
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        const dataArr = [];

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);

            const data = await this.getEmailsResult(user_name, role, currentDate, nextDate, nextDate);
            dataArr.push(data);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dataArr;
    }


    async updateEmailById(username: string, action_type: string, id: number, domain: string, name_domain: string, note: string): Promise<DataVerifyEmailModel> {

        if (username) {
            const record = await this.emailsRepository.findOne({ where: { id: id, employees: username } });
            if (record) {
                if (action_type === 'cancel') {

                    record.state = "Cancel"
                    record.note = note
                    record.updated_at = new Date()
                    await this.emailsRepository.save(record);

                    return {
                        state: "Success"
                    };
                } else if (action_type === 'submit') {

                    // check email by logic
                    const domainValidate = await this.emailsRepository.findOne({ where: { brand_domain: domain } });
                    if (!domainValidate) {
                        /* const emailsContent = await this.verifyEmailsService.getLatestEmails(15); */
                        const dataVerifyEmail = await this.verifyEmailsService.verifyEmailByAnywhere(name_domain);

                        record.brand_domain = domain;
                        record.name_domain = name_domain;
                        record.html = dataVerifyEmail.dataEmail && dataVerifyEmail.dataEmail.html && dataVerifyEmail.dataEmail.html !== '' ? dataVerifyEmail.dataEmail.html : null;
                        record.is_verify = dataVerifyEmail.is_verify;
                        record.note = note;
                        record.state = dataVerifyEmail.status ? "Success" : "Pending";
                        record.updated_at = new Date();

                        await this.emailsRepository.save(record);

                        const result = {
                            state: dataVerifyEmail.status ? "Success" : "Pending",
                            html: dataVerifyEmail.dataEmail && dataVerifyEmail.dataEmail.html ? dataVerifyEmail.dataEmail.html : ''
                        }

                        return result

                    } else {
                        return null;
                    }
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    @Cron('*/5 * * * *')
    async scheduleCheckEmail() {
        console.log("================== Schedule check pending start ==================")
        const record = await this.emailsRepository.find({ where: { state: 'Pending' } });

        /* const emailsContent = await this.verifyEmailsService.getLatestEmails(50); */
        if (record.length > 0) {
            for (let i = 0; i < record.length; i++) {
                const dataVerifyEmail = await this.verifyEmailsService.verifyEmailByAnywhere(record[i].name_domain)
                record[i].html = dataVerifyEmail.dataEmail ? dataVerifyEmail.dataEmail.html : null;
                record[i].is_verify = dataVerifyEmail.is_verify;
                record[i].state = dataVerifyEmail.status ? "Success" : "Pending";
                record[i].count_pending = record[i].count_pending + 1;
                record[i].updated_at = dataVerifyEmail.status ? new Date() : record[i].updated_at;

                if (record[i].count_pending >= 2016) {
                    record[i].state = "Delete"
                    record[i].note = "2016"
                }

                console.log(record[i].brand_domain, record[i].employees, dataVerifyEmail.status)

                await this.emailsRepository.save(record[i]);
            }
        }
        console.log("================== Schedule check pending end ==================")
    }


}