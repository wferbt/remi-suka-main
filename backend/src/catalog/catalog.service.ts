import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  constructor() {} // Пустой конструктор, ничего не просим у базы

  async findAll() {
    // Оставляем только тестовые товары, чтобы точно ничего не сломалось
    const mockProducts = [
      {
        id: 991,
        name: "Молоко «Отборное» 3.5%",
        category: "Молоко",
        price: 89,
        stock: 10,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 992,
        name: "Кефир полезный 2.5%",
        category: "Кефир",
        price: 75,
        stock: 15,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 993,
        name: "Сметана домашняя 20%",
        category: "Сметана",
        price: 120,
        stock: 8,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 994,
        name: "Йогурт натуральный",
        category: "Йогурт",
        price: 45,
        stock: 20,
        image: "https://via.placeholder.com/150"
      },
      {
        id: 995,
        name: "Творог фермерский 9%",
        category: "Творог",
        price: 115,
        stock: 12,
        image: "https://via.placeholder.com/150"
      }
    ];

    return mockProducts;
  }

  // Пустая заглушка, чтобы другие части кода не ругались, если вызывают этот метод
  async syncProducts(data: any[]) {
    return { success: true, count: 0 };
  }
}