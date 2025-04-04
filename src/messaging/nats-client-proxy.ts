import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class NatsClientProxy {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  send(pattern: string, data: any) {
    return this.client.send(pattern, data).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException(error);
      }),
    );
  }
}
