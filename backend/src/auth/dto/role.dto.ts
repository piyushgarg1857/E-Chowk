import { IsIn, IsString } from 'class-validator';

export class SetRoleDto {
  @IsString()
  @IsIn(['worker', 'employer'])
  role!: 'worker' | 'employer';
}
