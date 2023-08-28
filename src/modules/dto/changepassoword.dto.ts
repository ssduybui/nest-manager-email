import { IsNotEmpty } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty()
    user_name: string;

    @IsNotEmpty()
    old_password: string;

    @IsNotEmpty()
    new_password: string;
}