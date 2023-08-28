export class VerifyEmail {
    dataEmail?: GmailData;
    status: boolean;
    is_verify?: boolean;
}

export class GmailData {
    id: string;
    subject: string;
    snippet: string;
    html: string;
    links: {
        value: string;
        link: string;
    };
}

export class DataVerifyEmailModel {
    state: string;
    html?: string;
}