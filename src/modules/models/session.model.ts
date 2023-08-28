export class SessionModel {
    user_id?: number;
    user_name?: string;
    user_fullname?: string;
    iat?: number;
    exp?: number;

    constructor({ user_id, user_name, user_fullname, iat, exp }: {
        user_id?: number;
        user_name?: string;
        user_fullname?: string;
        iat: number;
        exp: number;
    }) {

        if (user_id !== null) this.user_id = user_id;
        if (user_name !== null) this.user_name = user_name;
        if (user_fullname !== null) this.user_fullname = user_fullname;
        if (iat !== null) this.iat = iat;
        if (exp !== null) this.exp = exp;
    }
}