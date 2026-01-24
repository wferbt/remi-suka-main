import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // 1. Конфиг (подгружает .env и переменные из Docker)
    ConfigModule.forRoot({ 
      isGlobal: true, 
    }), 
    
    // 2. Настройка базы через ConfigService (чтобы Docker-переменные точно подхватились)
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'grocery_db'), 
    port: config.get<number>('DB_PORT', 5432),
    username: config.get<string>('DB_USERNAME', 'postgres'),
    password: config.get<string>('DB_PASSWORD', 'your_password_here'),
    database: config.get<string>('DB_DATABASE', 'grocery_db'),
    
    // 1. Пытаемся загрузить сущности из скомпилированной папки dist
    entities: [__dirname + '/../**/*.entity.{js,ts}'], 
    
    // 2. Включаем автозагрузку как запасной вариант
    autoLoadEntities: true, 
    
    // 3. Синхронизация должна быть TRUE, чтобы таблицы создались сами
    synchronize: true,
    
    // 4. Добавь это, чтобы в логах видеть, какие запросы шлет Nest к базе
    logging: true, 
  }),
}),
    
    // 3. Твои модули
    CatalogModule,
    AuthModule,
    OrdersModule,
  ],
})
export class AppModule {}