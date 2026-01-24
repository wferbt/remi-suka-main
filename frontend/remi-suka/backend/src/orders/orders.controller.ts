import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Мы его сейчас создадим

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard) // Теперь без токена сюда не зайти!
  @Post()
  async create(@Request() req, @Body() body: any) {
    // req.user берется из токена автоматически
    return this.ordersService.createOrder(req.user.userId, body.address, body.items);
  }
}