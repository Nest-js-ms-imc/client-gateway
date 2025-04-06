import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller';
import { SecretsModule } from './secrets/aws-secrets.module';
import { NatsModule } from './transports/nats.module';
import { ImcController } from './imc/imc.controller';
import { EnvsService } from './secrets/envs.service';
import { NatsClientProxy, NatsHealthService } from './services';
import { AuthGuard } from './auth/guards/auth.guard';

@Module({
  imports: [SecretsModule, NatsModule],
  controllers: [AuthController, ImcController],
  providers: [EnvsService, NatsClientProxy, NatsHealthService, AuthGuard],
  exports: [NatsClientProxy],
})
export class InfraestructureModule {}
