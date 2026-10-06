import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100) full_name?: string;
  @IsOptional() @IsString() @MaxLength(50) skill_category?: string;
  @IsOptional() @IsNumber() @Min(0) daily_wage?: number;
  @IsOptional() @IsBoolean() is_available?: boolean;
  @IsOptional() @IsString() @MaxLength(200) current_location?: string;
}
