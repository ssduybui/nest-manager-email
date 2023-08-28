import { IsNotEmpty } from "class-validator";

export class UpdateEmailDto {
    @IsNotEmpty()
    action_type: string;

    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    domain: string;

    @IsNotEmpty()
    name_domain: string;

    note: string;
}