import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
              servers: envsService.get('NATS_SERVERS').split(','),
            },
          };
        },
        inject: [EnvsService],
      },
    ]),
    // ClientsModule.register([
    //   {
    //     name: NATS_SERVICE,
    //     transport: Transport.NATS,
    //     options: {
    //       servers: envs.natsServers,
    //     },
    //   },
    // ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
