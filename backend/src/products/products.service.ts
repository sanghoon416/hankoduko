import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private getUploadBase(): string {
    return process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'uploads');
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { images: true },
    });
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, category, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { images: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // 이미지 파일 삭제
    for (const image of product.images) {
      const filePath = path.join(this.getUploadBase(), image.url.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async addImage(productId: string, file: Express.Multer.File, alt?: string) {
    await this.findOne(productId);

    const url = `/uploads/products/${file.filename}`;
    return this.prisma.productImage.create({
      data: {
        url,
        alt,
        productId,
      },
    });
  }

  async removeImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다');
    }

    // 파일 삭제
    const filePath = path.join(this.getUploadBase(), image.url.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.productImage.delete({ where: { id: imageId } });
  }
}
