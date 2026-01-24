import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async syncProducts(data: any[]) {
    for (const item of data) {
      let product = await this.productRepository.findOne({ where: { externalId: item.id } });
      if (!product) {
        product = this.productRepository.create({ externalId: item.id });
      }
      product.name = item.name;
      product.price = item.price;
      product.stock = item.stock;
      await this.productRepository.save(product);
    }
    return { success: true, count: data.length };
  }

  async findAll() {
    // Получаем реальные товары из базы (если они есть)
    const realProducts = await this.productRepository.find();

    // Создаем тестовые товары для фильтров
    const mockProducts = [
      {
        id: 991,
        externalId: "m1",
        name: "Молоко «Отборное» 3.5%",
        category: "Молоко",
        price: 89,
        stock: 10,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 992,
        externalId: "k1",
        name: "Кефир полезный 2.5%",
        category: "Кефир",
        price: 75,
        stock: 15,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 993,
        externalId: "s1",
        name: "Сметана домашняя 20%",
        category: "Сметана",
        price: 120,
        stock: 8,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 994,
        externalId: "y1",
        name: "Йогурт натуральный",
        category: "Йогурт",
        price: 45,
        stock: 20,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 995,
        externalId: "t1",
        name: "Творог фермерский 9%",
        category: "Творог",
        price: 115,
        stock: 12,
        image: "https://via.placeholder.com/150"
      }
    ];

    // Склеиваем товары из базы и наши тестовые
    return [...realProducts, ...mockProducts];
  }
}
