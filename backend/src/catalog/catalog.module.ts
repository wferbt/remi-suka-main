import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Product } from './product.entity'; // Мы выяснили, что файл называется так

@Module({
  imports: [
    // Регистрируем сущность Product, чтобы TypeORM создал таблицу
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}