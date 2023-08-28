export class EmailsStatisticsModel {
    emails_success?: number;
    emails_pending?: number;
    emails_null?: number;
    emails_total?: number;
    updated_at?: string | Date;

    constructor({emails_success, emails_pending, emails_null, emails_total, updated_at } : {
        emails_success?: number,
        emails_pending?: number
        emails_null?: number,
        emails_total?: number
        updated_at?: string | Date
    }) {
        if (emails_success !== null) this.emails_success = emails_success;
        if (emails_pending !== null) this.emails_pending = emails_pending;
        if (emails_null !== null) this.emails_null = emails_null;
        if (emails_null !== null) this.emails_total = emails_total;
        if (updated_at !== null) this.updated_at = updated_at;
    }
}