import { IsNotEmpty } from "class-validator";

export class RoleDto {
    @IsNotEmpty()
    user_name: string;

}