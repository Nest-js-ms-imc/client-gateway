import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { Request } from 'express';
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { NATS_SERVICE } from '../../config';
import { NatsClientProxy } from '../../services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
    private readonly natsClientProxy: NatsClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // const user = await firstValueFrom(
      //   this.natsClientProxy.send('auth.verify.user', token),
      // );

      const user = await firstValueFrom(
        this.client.send('auth.verify.user', { token }).pipe(
          timeout(3000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(
                () => new UnauthorizedException('Token validation timeout'),
              );
            }
            return throwError(
              () => new UnauthorizedException('Token validation failed'),
            );
          }),
        ),
      );

      // this.natsClientProxy.send('auth.verify.user', { token }).subscribe({
      //   next: (user) => {
      //     console.log('AuthGuard', { user, token });

      //     request['user'] = user;
      //   },
      //   error: (err) => console.error('Error:', err),
      // });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // console.log('AuthGuard', { user, token });

      request['user'] = user;
      request['token'] = token;

      return true;
    } catch (error) {
      console.error('AuthGuard error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
