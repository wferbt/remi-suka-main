import { Controller, Get, Post, Body } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('sync')
  sync(@Body() data: any[]) {
    return this.catalogService.syncProducts(data);
  }

  @Get()
  getAll() {
    return this.catalogService.findAll();
  }
}
