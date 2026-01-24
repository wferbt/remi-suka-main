import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
    }), 
    
    // Временно отключаем TypeORM, чтобы сервер не падал без базы
    /*
    TypeOrmModule.forRootAsync({
      ...
    }),
    */
    
    CatalogModule,
    AuthModule,
    OrdersModule,
  ],
})
export class AppModule {}