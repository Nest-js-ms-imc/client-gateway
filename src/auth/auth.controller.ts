import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { LoginUserDto, LogoutUserDto, RegisterUserDto } from './dto';
import { NatsClientProxy } from '../services';
import { AuthGuard } from './guards/auth.guard';
import { User, Token } from './decorators';
import { CurrentUser } from './interfaces/current-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    // @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly natsClientProxy: NatsClientProxy,
  ) {}

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.natsClientProxy.send('auth.register.user', registerUserDto);
    // return this.client.send('auth.register.user', registerUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.natsClientProxy.send('auth.login.user', loginUserDto);
    // return this.client.send('auth.login.user', loginUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }

  @Post('logout')
  logout(@Body() logoutUserDto: LogoutUserDto) {
    return this.natsClientProxy.send('auth.logout.user', logoutUserDto);
    // return this.client.send('auth.logout.user', logoutUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }

  @Get('verifyToken')
  verifyToken(@Body() logoutUserDto: LogoutUserDto) {
    // verifyToken(@User() user: CurrentUser, @Token() token: string) {
    // return { user, token };
    return this.natsClientProxy.send('auth.verify.user', logoutUserDto);
    // return this.client.send('auth.logout.user', logoutUserDto).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );
  }
}
