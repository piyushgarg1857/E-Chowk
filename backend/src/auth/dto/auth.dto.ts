import { IsNotEmpty, IsString, Matches, Length, IsOptional, IsIn } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{9,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone!: string;

  @IsOptional()
  @IsString()
  @IsIn(['sms', 'whatsapp'])
  channel?: 'sms' | 'whatsapp';
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{9,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone!: string;

  @IsString()
  @Length(4, 8)
  otp!: string;
}

export class FirebaseLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{9,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone!: string;

  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  @IsIn(['worker', 'employer'])
  role?: 'worker' | 'employer';

  @IsOptional()
  @IsString()
  fullName?: string;
}
