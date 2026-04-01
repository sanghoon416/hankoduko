import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  refundBank?: string;

  @IsOptional()
  @IsString()
  refundAccount?: string;
}
