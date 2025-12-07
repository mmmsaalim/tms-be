import { IsNotEmpty, IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsInt()
  @Type(() => Number) 
  projectId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  typeId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priorityId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  assignedToId?: number;
}