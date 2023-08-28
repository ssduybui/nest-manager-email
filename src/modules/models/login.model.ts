export class LoginModel {
    user_name?: string;
    user_fullname?: string;
    user_state?: string;
    access_token?: string;

    constructor({user_name,user_fullname, user_state, access_token,  }: {
        user_name?: string;
        user_state?: string;
        user_fullname?: string;
        access_token?: string;
    }) {

        if (user_name !== null) this.user_name = user_name;
        if (user_fullname !== null) this.user_fullname = user_fullname;
        if (user_state !== null) this.user_state = user_state;
        if (access_token !== null) this.access_token = access_token;
    }
}