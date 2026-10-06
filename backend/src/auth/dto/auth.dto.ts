import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{9,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone!: string;
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
