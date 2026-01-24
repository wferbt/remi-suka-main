import { Module } from '@nestjs/common';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    CatalogModule, // Оставляем только каталог
  ],
})
export class AppModule {}