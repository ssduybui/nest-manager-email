export class ChangePasswordModel {
    user_name?: string;
    user_password?: string;

    constructor({ user_name, user_password }: {
        user_name?: string;
        user_password?: string;
    }) {

        if (user_name !== null) this.user_name = user_name;
        if (user_password !== null) this.user_password = user_password;
    }
}