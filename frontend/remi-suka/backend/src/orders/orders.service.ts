import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../catalog/product.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Изменили тип id с string на number или добавили конвертацию
  async createOrder(user: User, address: string, items: { id: number, quantity: number }[]) {
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      // Используем +item.id чтобы TypeScript был уверен, что это число
      const product = await this.productRepository.findOne({ where: { id: +item.id } });
      
      if (!product) {
        throw new BadRequestException(`Товар с ID ${item.id} не найден`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Товара ${product.name} недостаточно на складе (осталось: ${product.stock})`);
      }

      // Считаем сумму
      totalPrice += Number(product.price) * item.quantity;
      
      // Уменьшаем остаток согласно пункту 5.3 ТЗ
      product.stock -= item.quantity;
      await this.productRepository.save(product);

      orderItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = this.orderRepository.create({
      user,
      address,
      totalPrice,
      items: orderItems,
      status: 'pending'
    });

    return this.orderRepository.save(order);
  }

  async getUserOrders(user: User) {
    // Важно для личного кабинета (пункт 3.4 ТЗ)
    return this.orderRepository.find({ 
      where: { user: { id: user.id } }, 
      order: { createdAt: 'DESC' } 
    });
  }
}