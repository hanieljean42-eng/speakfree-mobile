import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsEnum(['STUDENT', 'SCHOOL'])
  @IsNotEmpty()
  sender: 'STUDENT' | 'SCHOOL';
}
