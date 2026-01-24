import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body('phone') phone: string) {
    return this.authService.sendCode(phone);
  }
  @Post('verify')
  async verify(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.verifyCode(phone, code);
  }
}