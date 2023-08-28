import { IsNotEmpty } from "class-validator";

export class BlockUserDto {
    @IsNotEmpty()
    action_type: string;

    @IsNotEmpty()
    user_name: string;
}