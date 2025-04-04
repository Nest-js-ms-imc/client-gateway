import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller';
import { SecretsModule } from './secrets/aws-secrets.module';
import { NatsModule } from './transports/nats.module';
import { ImcController } from './imc/imc.controller';
import { EnvsService } from './secrets/envs.service';
import { NatsClientProxy } from './messaging/nats-client-proxy';

@Module({
  imports: [SecretsModule, NatsModule],
  controllers: [AuthController, ImcController],
  providers: [EnvsService, NatsClientProxy],
  exports: [NatsClientProxy],
})
export class InfrastructureModule {}
