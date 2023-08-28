export class DataEmailModels {
    records: EmailsModel[];
    page: number
}

export class EmailsModel {
    id: number;
    brand_name?: string;
    brand_domain?: string;
    note?: string;
    state?: string;
    employees?: string;
    updated_at?: string | Date;
    created_at?: string | Date;

    constructor({ id, brand_name, brand_domain, note, state, employees, updated_at, created_at }: {
        id?: number;
        brand_name?: string;
        brand_domain?: string;
        note?: string;
        state?: string;
        employees?: string;
        updated_at?: string | Date;
        created_at?: string | Date;
    }) {
        if (id !== null) this.id = id;
        if (brand_name !== null) this.brand_name = brand_name;
        if (brand_domain !== null) this.brand_domain = brand_domain;
        if (note !== null) this.note = note;
        if (state !== null) this.state = state;
        if (employees !== null) this.employees = employees;
        if (updated_at !== null) this.updated_at = updated_at;
        if (created_at !== null) this.created_at = created_at;
    }
}