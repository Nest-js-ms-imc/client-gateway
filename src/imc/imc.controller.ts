import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { NATS_SERVICE } from 'src/config';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RecordImcDto, RecordsImcDomainDto } from './dto';
import { NatsClientProxy } from 'src/messaging/nats-client-proxy';

@Controller('imc')
export class ImcController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
    private readonly natsClientProxy: NatsClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post('newImc')
  newRecordImc(@Body() registerUserDto: RecordImcDto) {
    return this.natsClientProxy.send('imc.new.imc', registerUserDto);
    // return this.client.send('imc.new.imc', registerUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }

  @UseGuards(AuthGuard)
  @Get('listImc')
  listImcRecords(@Body() loginUserDto: RecordsImcDomainDto) {
    return this.natsClientProxy.send('imc.list.records', loginUserDto);
    // return this.client.send('imc.list.records', loginUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }
}
