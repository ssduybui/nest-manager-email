export class RegisterModel {
    user_name: string;
    user_password?: string;
    user_fullname?: string;

    constructor({ user_name, user_password, user_fullname }: {
        user_name?: string;
        user_password?: string;
        user_fullname?: string;
    }) {
        if (user_name !== null) this.user_name = user_name;
        if (user_password !== null) this.user_password = user_password;
        if (user_fullname !== null) this.user_fullname = user_fullname;
    }
}