import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { NATS_SERVICE } from '../config';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RecordImcDto, RecordsImcDomainDto } from './dto';
import { User } from '../auth/decorators';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { NatsClientProxy } from '../services';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('IMC')
@Controller('imc')
export class ImcController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
    private readonly natsClientProxy: NatsClientProxy,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('new-record')
  @ApiOperation({ summary: 'register BMI' })
  @ApiResponse({ status: 201, description: 'IMC calculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  newRecordImc(@Body() recordImcDto: RecordImcDto, @User() user: CurrentUser) {
    // this.natsClientProxy.send('auth.verify.user', { token }).subscribe({
    //   next: (response) => console.log(response),
    //   error: (err) => console.error('Error:', err),
    // });

    // console.log({ user });

    return this.natsClientProxy.send('imc.new.record', {
      ...recordImcDto,
      userId: user.id,
    });
    // return this.client.send('imc.new.record', registerUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('list-records')
  @ApiOperation({ summary: 'list BMI records' })
  @ApiResponse({ status: 201, description: 'list BMI records successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  listImcRecords(@User() user: CurrentUser) {
    return this.natsClientProxy.send('imc.list.records', { id: user.id });
    // return this.client.send('imc.list.records', loginUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }
}
