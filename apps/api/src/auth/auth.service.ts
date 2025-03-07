import { ConfigService, CryptoService, LoggingService } from '@douglasneuroinformatics/libnest';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthPayload, JwtPayload } from '@opendatacapture/schemas/auth';
import type { GroupModel, UserModel } from '@prisma/client';

import { AbilityFactory } from '@/ability/ability.factory';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly loggingService: LoggingService
  ) {}

  /** Validates the provided credentials and returns an access token */
  async login(username: string, password: string): Promise<AuthPayload> {
    const user = await this.getUser(username);

    const isAuth = await this.cryptoService.comparePassword(password, user.hashedPassword);
    if (!isAuth) {
      throw new UnauthorizedException('Invalid password');
    }

    const ability = this.abilityFactory.createForUser(user);

    const payload: JwtPayload = {
      firstName: user.firstName,
      groups: user.groups,
      lastName: user.lastName,
      permissions: ability.rules,
      username: user.username
    };

    const accessToken = await this.signToken(payload);

    return { accessToken };
  }

  /** Wraps UserService.getByUsername with appropriate exception handling */
  private async getUser(username: string) {
    let user: UserModel & { groups: GroupModel[] };
    try {
      user = await this.usersService.findByUsername(username);
      // user = await this.usersService.findByUsername(username).then((doc) => doc.toObject({ virtuals: true }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid username');
      }
      this.loggingService.error(error);
      throw new InternalServerErrorException('Internal Server Error', {
        cause: error instanceof Error ? error : undefined
      });
    }
    return user;
  }

  private async signToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: this.configService.get('SECRET_KEY')
    });
  }
}
