import { IsEnum, IsString, IsOptional } from 'class-validator';

export class UpdateSchoolStatusDto {
  @IsEnum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'])
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
