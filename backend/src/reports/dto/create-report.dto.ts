import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsEnum([
    'HARCELEMENT_PHYSIQUE',
    'HARCELEMENT_VERBAL',
    'CYBER_HARCELEMENT',
    'DISCRIMINATION',
    'VIOLENCE',
    'VOL',
    'AUTRE',
  ])
  @IsNotEmpty()
  type: string;

  @IsDateString()
  @IsOptional()
  incidentDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  place?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  witnesses?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  @IsNotEmpty()
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}
