import { IsString, MaxLength } from 'class-validator';

export class AgentMessageDto {
  @IsString()
  @MaxLength(2000)
  message!: string;
}
