import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @IsNotEmpty()
  nameFirst: string;

  @IsString()
  @IsNotEmpty()
  nameLast: string;

  @IsString()
  @IsNotEmpty()
  nameFull: string;

  @IsString({ each: true })
  @IsOptional()
  groups?: string[];

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsOptional()
  email?: string;
}

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  nameFirst: string;

  @IsString()
  @IsNotEmpty()
  nameLast: string;

  @IsString()
  @IsNotEmpty()
  nameFull: string;

  @IsString({ each: true })
  @IsNotEmpty()
  groups?: string[];

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsNotEmpty()
  email?: string;
}
