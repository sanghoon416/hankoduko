import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
