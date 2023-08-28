import { IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    user_name: string;

    @IsNotEmpty()
    user_password: string;
}