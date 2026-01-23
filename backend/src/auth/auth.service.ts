import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async sendCode(phone: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    let user = await this.userRepository.findOne({ where: { phone } });
    if (!user) user = this.userRepository.create({ phone });
    
    user.currentSmsCode = code;
    await this.userRepository.save(user);
    
    console.log(`\n[SMS] КОД ДЛЯ ${phone}: ${code}\n`);
    return { message: 'Code sent' };
  }

  async verifyCode(phone: string, code: string) {
    const user = await this.userRepository.findOne({ where: { phone } });

    if (!user || user.currentSmsCode !== code) {
      throw new UnauthorizedException('Неверный код!');
    }

    user.currentSmsCode = null; // Очищаем код после входа
    await this.userRepository.save(user);

    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user
    };
  }
}