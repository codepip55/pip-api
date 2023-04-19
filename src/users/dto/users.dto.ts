import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserDto {
    @IsString()
    @IsNotEmpty()
    nameFirst: string;

    @IsString()
    @IsNotEmpty()
    nameLast: string;

    @IsString({ each: true })
    @IsArray()
    groups: string[];

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    @IsBoolean()
    @IsNotEmpty()
    isBanned: boolean;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    customDomainEmail?: string | null;

    @IsString()
    @IsOptional()
    password?: string;
}