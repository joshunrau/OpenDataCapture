import { ConfigService } from '@douglasneuroinformatics/libnest';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '@/users/users.module';

import { AbilityFactory } from './ability.factory';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY')
      })
    }),
    UsersModule
  ],
  providers: [AbilityFactory, AuthService]
})
export class AuthModule {}
