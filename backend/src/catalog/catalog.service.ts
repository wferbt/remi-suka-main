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

  findAll() {
    return this.productRepository.find();
  }
}
