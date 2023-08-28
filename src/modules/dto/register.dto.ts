import { IsNotEmpty } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    user_name: string;

    @IsNotEmpty()
    user_fullname: string;

    user_role?: string;

    @IsNotEmpty()
    creater_token: string;
}