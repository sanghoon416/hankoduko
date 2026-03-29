import { IsOptional, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '@prisma/client';

export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  search?: string;
}
