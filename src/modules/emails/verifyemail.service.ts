import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Buffer } from 'buffer';
import * as cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios'; // Import AxiosResponse
import { GmailData, VerifyEmail } from '../models/verifyemail.model';
import express, { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GmailProfileEntity } from '../entities/gmail_profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VerifyEmailService {
    private oAuth2Client;

    constructor(
        @InjectRepository(GmailProfileEntity)
        private readonly gmailProfileRepository: Repository<GmailProfileEntity>,

    ) {

        this.oAuth2Client = new google.auth.OAuth2(
            '3773204707-vdsgik373rh2m5pv8iu5quf24v0oet09.apps.googleusercontent.com',
            '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',
            'http://localhost:3000/emails'
        );

        this.oAuth2Client.setCredentials({
            access_token: 'ya29.a0AfB_byBbyBwJbDJkzN3jX_QGrNQauG1EIsh7l_YdBDlbTizEtA6yF6Xn6N8BkaBbu3v74m_DjsH00e-orCW-msdbVveMXT5RmHsYQqetI0WfakSwFZq8ycOT_lEsSD5zZ1TTz0VJU_AY9Vj5TlVrXQnRdH3cTI1Im-eOdQaCgYKAf4SARESFQHsvYlsyfxrjiEXBo5rYVvILb3-PA0173',
            refresh_token: '1//04PiiAULkwLqHCgYIARAAGAQSNwF-L9Irqu_c4RZPuO38PF8m7oz20339ZL5AYKKfMTYq8uyoDlUCKoJUJzZcIfU3ANb-fXBiW-s',
        });

        /* this.saveCredentials() */

    }

    /* async saveCredentials() {
        const gmailProfile = await this.gmailProfileRepository.findOne({
            where: {
                state: true,
            },
        })

        if (gmailProfile) {
            this.oAuth2Client = new google.auth.OAuth2(
                process.env.GMAIL_CLIENT_ID,
                process.env.GMAIL_CLIENT_SECRET_KEY,
                'http://localhost:3000/emails'
            );

            const currentTime = new Date().getTime();
            const expiresIn = gmailProfile.exprires_in;
            if (currentTime > expiresIn) {
                const dataToken = await this.getAuthorizationCode(gmailProfile.refresh_token)
                gmailProfile.access_token = dataToken.access_token;
                gmailProfile.exprires_in = new Date().getTime() + dataToken.exprires_in * 1000
                gmailProfile.updated_at = new Date();
                await this.gmailProfileRepository.save(gmailProfile)

                this.oAuth2Client.setCredentials({ access_token: dataToken.access_token })
            } else {
                this.oAuth2Client.setCredentials({ access_token: gmailProfile.access_token })
            }
        } else {
            return null;
        }
    }

    async getAuthorizationCode(refreshToken: string): Promise<any> {
        try {
            const response = await axios.post('https://oauth2.googleapis.com/token', null, {
                params: {
                    refresh_token: refreshToken,
                    client_id: process.env.GMAIL_CLIENT_ID,
                    client_secret: process.env.GMAIL_CLIENT_SECRET_KEY,
                    grant_type: 'refresh_token',
                },
            });

            return response.data;
        } catch (error) {
            console.log(error);
            return '';
        }
    } */

    async verifyEmail(link: string, data: any[]): Promise<VerifyEmail> {

        try {

            const emailsContent = data;
            const existLinkText = await this.checkExistLinkText(link, emailsContent);

            if (existLinkText.status) {
                const checkEmailsVerify = await this.checkEmailsVerify(existLinkText.dataEmail);
                console.log("checkExistLinkText")
                return {
                    status: true,
                    dataEmail: existLinkText.dataEmail,
                    is_verify: checkEmailsVerify
                }
            } else {
                const checkLinksRedirect = await this.checkLinksRedirect(link, emailsContent);

                if (checkLinksRedirect.status) {
                    console.log("checkLinksRedirect")
                    const checkEmailsVerify = await this.checkEmailsVerify(checkLinksRedirect.dataEmail);
                    return {
                        status: true,
                        dataEmail: checkLinksRedirect.dataEmail,
                        is_verify: checkEmailsVerify
                    }
                } else {
                    const verifyContentEmailByName = await this.checkContentEmailByDomain(link, emailsContent);

                    if (verifyContentEmailByName.status) {
                        console.log("verifyContentEmailByName")
                        const checkEmailsVerify = await this.checkEmailsVerify(verifyContentEmailByName.dataEmail);

                        return {
                            status: true,
                            dataEmail: verifyContentEmailByName.dataEmail,
                            is_verify: checkEmailsVerify
                        }
                    } else {
                        console.log("No Email")
                        return {
                            status: false,

                        }
                    }
                }
            }
        } catch (error) {
            console.log(error)
            return {
                status: false
            }
        }

    }

    async checkEmailsVerify(data: GmailData) {
        try {
            const keywordCheck = ['confirm', 'confirmation', 'verify', 'verification', 'activate', 'complete', 'validation'];

            const contentToCheck = [data.subject, data.snippet, data.html];

            const lowercaseContentCheck = contentToCheck.some(content =>
                keywordCheck.some(keyword => content.toLowerCase().includes(keyword))
            );

            return lowercaseContentCheck;
        } catch (error) {
            console.log(error)
            return false;
        }

    }

    async checkContentEmailByDomain(link: string, data: any[]): Promise<VerifyEmail> {
        try {
            const domainSubmit = link;
            let result = {
                status: false,
                dataEmail: null,
                is_verify: false
            }

            for (const emailContent of data) {
                const linkFilter = emailContent.html.toLowerCase().includes(domainSubmit.toLowerCase());
                if (linkFilter) {
                    result = {
                        status: true,
                        dataEmail: emailContent,
                        is_verify: false
                    }
                    break;
                }
            }

            return result;
        } catch (error) {
            console.log(error)
            return {
                status: false
            }
        }
    }

    async checkLinksRedirect(link: string, data: any[]): Promise<VerifyEmail> {
        try {
            const domainSubmit = link;
            let result = false;
            const validEmail = data.find(async emailContent => {
                const links = emailContent.links[0].link;
                const domainRedirect = await this.getRealHostnamesFromLinks(links);

                if (domainRedirect !== null) {
                    const parsedRedirectUrl = new URL(domainRedirect);
                    const domainResult = parsedRedirectUrl.hostname;
                    result = domainResult.includes(domainSubmit);
                }
            });
            if (result) {
                return {
                    dataEmail: validEmail,
                    status: true
                };
            } else {
                return {
                    status: false
                };
            }
        } catch (error) {
            console.error(error);
            return {
                status: false
            };
        }
    }

    /* async getMainDomain(link) {
        const parsedUrl = new URL(link);
        const domainParts = parsedUrl.hostname.split('.');

        return domainParts[1];


    } */

    async checkExistLinkText(link: string, data: any[]): Promise<VerifyEmail> {
        try {
            const domainSubmit = link;

            const matchingLinks = [];
            const emailsResult = [];

            for (const emailContent of data) {
                const linkFilter = emailContent.links.filter((item: { conent: string, link: string }) => {

                    return item.link?.includes(domainSubmit);
                });

                if (linkFilter.length > 0) {
                    matchingLinks.push(...linkFilter);
                    emailsResult.push(emailContent);
                    break;
                }
            }

            if (matchingLinks.length > 0) {
                return {
                    dataEmail: emailsResult[0],
                    status: true
                };
            } else {
                return {
                    status: false
                };
            }
        } catch (error) {
            console.log(error);
        }

    }

    // Lấy ra email mới nhất
    async getLatestEmails(numberEmail: number) {
        /* await this.saveCredentials() */
        const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });

        try {
            const res = await gmail.users.messages.list({
                userId: 'me',
                maxResults: numberEmail, // số lương email muốn lấy ra
            });

            const messages = res.data.messages;
            const emails = [];

            for (const message of messages) {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                });

                const emailId = email.data.id;
                const emailSubject = await this.getHeader(email.data.payload.headers, 'Subject');
                const emailSnippet = email.data.snippet;
                const emailHtml = await this.extractEmailBody(email.data.payload);
                const emailLink = await this.extractLinksFromHTML(emailHtml);

                const emailData = {
                    id: emailId,
                    subject: emailSubject,
                    snippet: emailSnippet,
                    html: emailHtml,
                    links: emailLink
                };

                emails.push(emailData);
            }
            /* const hostName = await this.getRealHostnamesFromLinks(emails[0].link[0]) */
            return emails;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    }

    // lấy title email
    async getHeader(headers, name) {
        const header = headers.find(header => header.name === name);
        return header ? header.value : '';
    }


    // Đọc vào nội dung trong email và giải mã
    async extractEmailBody(payload): Promise<string> {
        try {
            if (payload.parts) {
                const parts = payload.parts;
                /* const bodyData = parts.filter(part => part.mimeType === 'text/html')[0] || parts[0]; */
                const bodyData = await this.findHtmlPart(parts)
                /* const encodedBody = bodyData.body.data; */
                const decodedBody = Buffer.from(bodyData, 'base64').toString('utf-8').replace(/\r|\n|\t/g, ''); // giải mã hóa nội dung

                return decodedBody;
            } else if (payload.body) {
                const encodedBody = payload.body.data;

                const decodedBody = Buffer.from(encodedBody, 'base64').toString('utf-8').replace(/\r|\n|\t/g, ''); // giải mã hóa nội dung

                return decodedBody;
            } else {
                return '';
            }
        } catch (error) {
            console.log(error);
            return '';
        }

    }


    // tìm body.data có mimeType = text/html
    async findHtmlPart(parts) {
        for (const part of parts) {
            if (part.mimeType === 'text/html') {
                return part.body.data;
            }

            if (part.parts) {
                const foundHtmlPart = await this.findHtmlPart(part.parts);
                if (foundHtmlPart) {
                    return foundHtmlPart;
                }
            }
        }

        return null;
    }

    async extractLinksFromHTML(html) {
        try {
            const $ = cheerio.load(html);
            const links = [];

            $('a').each((index, element) => {
                const link = $(element).attr('href');
                const content = $(element).text();
                if (link?.includes('http') || link?.includes('https')) {
                    const data = {
                        content: content,
                        link: link,
                    }
                    links.push(data);
                }
            });

            return links;
        } catch (error) {
            console.error(error);
        }

    }

    async getRealHostnamesFromLinks(link: string) {
        try {
            const response = await axios.get(link, { maxRedirects: 5 }); // Allow a maximum of 5 redirects
            // Extract the final URL after all redirects
            const finalUrl = response.request.res.responseUrl;

            // Extract the domain from the final URL
            const urlObj = new URL(finalUrl);
            /* const domain = urlObj.hostname; */
            return urlObj;
        } catch (error) {
            if (error.response) {
                console.error('Response error:', error.response.status, error.response.statusText);
                return null;
            } else {
                console.error('Error:', error.message);
                return null;
            }
        }
    }


    // Verify email by query in:anywhere
    async verifyEmailByAnywhere(name_domain: string) {
        const listEmails = await this.getEmailByInAnywhere(name_domain);

        if (listEmails.length > 0) {
            for (let i = 0; i < listEmails.length; i++) {
                const checkVerifyEmail = await this.checkEmailsVerify(listEmails[i])
                if (checkVerifyEmail) {
                    return {
                        status: true,
                        dataEmail: listEmails[i],
                        is_verify: true
                    }
                } else {
                    return {
                        status: true,
                        dataEmail: listEmails[i],
                        is_verify: false
                    }
                }
            }
        } else {
            return {
                status: false
            };
        }

    }

    async getEmailByInAnywhere(name_domain: string): Promise<any> {

        const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
        const filterBuilder = {
            userId: 'me',
            maxResults: 100, // Số lượng email muốn lấy
            order: "date",
            q: `in:anywhere ${name_domain}`, // Sử dụng chuỗi thay vì dấu ngoặc đơn
        };

        try {
            const res = await gmail.users.messages.list(filterBuilder);

            const messages = res.data.messages;
            /* console.log(messages); */
            if (!messages || messages.length === 0) {
                /* console.log('No messages found.'); */
                return [];
            }

            const emails = messages.map(message => message.id); // Lấy danh sách các ID email
            const emailsArr = [];

            for (let i = 0; i < emails.length; i++) {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: emails[i],
                });

                const emailId = email.data.id;
                const emailSubject = await this.getHeader(email.data.payload.headers, 'Subject');
                const emailSnippet = email.data.snippet;
                const emailHtml = await this.extractEmailBody(email.data.payload);
                const emailLink = await this.extractLinksFromHTML(emailHtml);

                const emailData = {
                    id: emailId,
                    subject: emailSubject,
                    snippet: emailSnippet,
                    html: emailHtml,
                    links: emailLink
                };

                emailsArr.push(emailData);
            }

            return emailsArr; // Trả về danh sách ID email
        } catch (error) {
            console.error('Error fetching emails:', error);
            return [];
        }
    }

}
