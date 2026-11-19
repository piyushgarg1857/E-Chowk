import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobDto {
  @IsString() @MaxLength(50) required_skill!: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsString() @MaxLength(200) location!: string;
  @IsOptional() @IsNumber() @Min(0) offered_wage?: number;
  @IsOptional() @IsInt() @Min(1) duration_days?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() starts_at?: string;
}

export class SearchJobsDto {
  @IsOptional() @IsString() skill?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
}

export class ApplicationDecisionDto {
  @IsString() status!: 'accepted' | 'rejected';
}
