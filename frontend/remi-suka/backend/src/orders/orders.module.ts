import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './order.entity';
import { Product } from '../catalog/product.entity'; // Импортируем Product

@Module({
  imports: [
    // Добавляем Product сюда, чтобы OrdersService мог его видеть
    TypeOrmModule.forFeature([Order, Product]), 
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}