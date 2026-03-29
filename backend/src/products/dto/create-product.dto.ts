import { IsString, IsInt, IsEnum, MinLength, Min } from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  thumbnailUrl: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsEnum(ProductCategory)
  category: ProductCategory;
}
