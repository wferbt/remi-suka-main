import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Добавим fallback значение на случай, если конфиг не успел прогрузиться
      secretOrKey: configService.get<string>('JWT_SECRET') || 'temporary_secret_for_startup',
    });
  }

  async validate(payload: any) {
    // Если в токене нет данных, выкидываем ошибку
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, phone: payload.phone };
  }
}