import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout, throwError } from 'rxjs';

import { TimeoutError } from 'rxjs';
import { NATS_SERVICE } from '../config';

@Injectable()
export class NatsHealthService {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async checkConnection(): Promise<void> {
    try {
      await firstValueFrom(
        this.client.send('auth.verify.user', {}).pipe(
          timeout(3000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(
                () => new UnauthorizedException('NATS timeout'),
              );
            }
            return throwError(
              () => new UnauthorizedException('NATS error: ' + err.message),
            );
          }),
        ),
      );
    } catch (err) {
      console.error('❌ NATS no está disponible:', err.message);
      throw new UnauthorizedException('NATS service is unavailable');
    }
  }
}
