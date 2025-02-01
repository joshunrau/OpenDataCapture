import { ConfigService } from '@douglasneuroinformatics/libnest/config';
import { Injectable, type NestMiddleware } from '@nestjs/common';

@Injectable()
export class DelayMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(_req: any, _res: any, next: (error?: any) => void) {
    const responseDelay = this.configService.get('API_RESPONSE_DELAY');
    if (!responseDelay) {
      return next();
    }
    setTimeout(() => {
      next();
    }, responseDelay);
  }
}
