// src/modules/programs/dto/update-program.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramDTO } from './create-program.dto';
import { Transform, Type } from 'class-transformer';
import { 
  IsOptional, 
  ValidateNested, 
  IsArray, 
  IsNumber, 
  IsObject, 
  IsDateString, 
  IsEnum 
} from 'class-validator';
import { NameDto, DescriptionDto, ProjectDto } from './create-program.dto';
import { ProgramCategory, ProgramStatus } from '../../../config/constants';

export class UpdateProgramDTO extends PartialType(CreateProgramDTO) {
  @IsOptional()
  @ValidateNested()
  @Type(() => NameDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  name?: NameDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DescriptionDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  description?: DescriptionDto;

  @IsOptional()
  @IsEnum(ProgramCategory)
  category?: ProgramCategory;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        if (value.includes(',')) {
          return value.split(',').map(Number);
        }
        return [Number(value)];
      }
    }
    return value;
  })
  sdgAlignment?: number[];

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  kpiTargets?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  budget?: number;

  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  projects?: ProjectDto[];
}