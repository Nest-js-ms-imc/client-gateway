import { Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { NATS_SERVICE, envs } from '../config';
import { EnvsService } from '../secrets/envs.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        useFactory: async (envsService: EnvsService) => {
          await envsService.loadSecrets();

          return {
            transport: Transport.NATS,
            options: {
              servers: envsService.get('NATS_SERVERS').split('**'),
            },
          };
        },
        inject: [EnvsService],
      },
    ]),
  ],
  // exports: [ClientsModule],
  exports: [
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        useFactory: async (envsService: EnvsService) => {
          await envsService.loadSecrets();

          return {
            transport: Transport.NATS,
            options: {
              servers: envsService.get('NATS_SERVERS').split('**'),
            },
          };
        },
        inject: [EnvsService],
      },
    ]),
  ],
  // providers: [
  //   {
  //     provide: NATS_SERVICE,
  //     useFactory: () =>
  //       ClientProxyFactory.create({
  //         transport: Transport.NATS,
  //         options: { servers: envs.natsServers },
  //       }),
  //   },
  // ],
})
export class NatsModule {}
