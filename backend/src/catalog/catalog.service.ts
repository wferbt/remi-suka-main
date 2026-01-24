import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  async findAll() {
    return [
      { id: 991, name: "Молоко «Отборное»", category: "Молоко", price: 89, image: "https://via.placeholder.com/150" },
      { id: 992, name: "Кефир полезный", category: "Кефир", price: 75, image: "https://via.placeholder.com/150" },
      { id: 993, name: "Сметана 20%", category: "Сметана", price: 120, image: "https://via.placeholder.com/150" },
      { id: 994, name: "Творог 9%", category: "Творог", price: 110, image: "https://via.placeholder.com/150" }
    ];
  }
}