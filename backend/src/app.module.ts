import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ImportModule } from './import/import.module';
import { StorageModule } from './storage/storage.module';
import { UploadModule } from './upload/upload.module';
import { FiltersModule } from './filters/filters.module';
import { CartController } from './cart/cart.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'ledvl',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Отключаем синхронизацию, используем миграции
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 5,
      retryDelay: 3000,
    }),
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    AuthModule,
    AdminModule,
    ImportModule,
    StorageModule,
    UploadModule,
    FiltersModule,
  ],
  controllers: [AppController, CartController],
  providers: [AppService],
})
export class AppModule {}
