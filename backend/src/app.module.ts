import { Module } from '@nestjs/common';
import { CatalogModule } from './catalog/catalog.module'; // Импорт модуля

@Module({
  imports: [CatalogModule], // Должен быть здесь!
  controllers: [],
  providers: [],
})
export class AppModule {}