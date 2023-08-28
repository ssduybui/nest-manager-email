export class RoleModel {
    user_role?: string;
    user_name?: string;
    user_fullname?: string;

    constructor({ user_role, user_name, user_fullname }: {
        user_role?: string;
        user_name?: string;
        user_fullname?: string;
    }) {

        if (user_role !== null) this.user_role = user_role;
        if (user_name !== null) this.user_name = user_name;
        if (user_fullname !== null) this.user_fullname = user_fullname;
    }
}