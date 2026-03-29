import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  SHIPPING: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // 1. 상품 조회 + 재고 확인
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('존재하지 않는 상품이 포함되어 있습니다');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `"${product.name}" 재고가 부족합니다 (남은 재고: ${product.stock})`,
        );
      }
    }

    // 2. totalPrice 계산
    let totalPrice = 0;
    const orderItemsData = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      totalPrice += product.price * item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    // 3. 트랜잭션: 주문 생성 + 재고 차감
    const order = await this.prisma.$transaction(async (tx) => {
      // 재고 차감
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 주문 생성
      return tx.order.create({
        data: {
          userId,
          totalPrice,
          shippingName: dto.shippingName,
          shippingPhone: dto.shippingPhone,
          shippingAddress: dto.shippingAddress,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });
    });

    return order;
  }

  async findMyOrders(userId: string, query: OrderQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('주문을 찾을 수 없습니다');
    }
    return order;
  }

  async findAllOrders(query: OrderQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOrderAdmin(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
    });
    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다');
    }
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다');
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `${order.status} 상태에서 ${newStatus}(으)로 변경할 수 없습니다`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { items: true },
    });
  }
}
