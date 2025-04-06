import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { NATS_SERVICE } from '../config';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RecordImcDto, RecordsImcDomainDto } from './dto';
import { User, Token } from '../auth/decorators';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { NatsClientProxy } from '../services';

@Controller('imc')
export class ImcController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
    private readonly natsClientProxy: NatsClientProxy,
  ) {}

  // @UseGuards(AuthGuard)
  @Post('new-record')
  newRecordImc(
    @Body() registerUserDto: RecordImcDto,
    // @User() user: CurrentUser,
    // @Token() token: string,
  ) {
    return this.natsClientProxy.send('imc.new.record', registerUserDto);
    // return this.client.send('imc.new.record', registerUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }

  // @UseGuards(AuthGuard)
  @Get('list-records')
  listImcRecords(
    @Body() loginUserDto: RecordsImcDomainDto,
    // @User() user: CurrentUser,
    // @Token() token: string,
  ) {
    return this.natsClientProxy.send('imc.list.records', loginUserDto);
    // return this.client.send('imc.list.records', loginUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }
}
