import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUserDto, LoginUserDto, LogoutUserDto } from './dto';
import { NatsClientProxy } from '../services';

describe('AuthController', () => {
  let controller: AuthController;
  let mockNatsClientProxy: { send: jest.Mock };

  beforeEach(async () => {
    mockNatsClientProxy = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: NatsClientProxy,
          useValue: mockNatsClientProxy,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user', () => {
    const dto: RegisterUserDto = {
      email: 'test@example.com',
      password: '123456',
      name: 'Test User',
    };

    mockNatsClientProxy.send.mockReturnValueOnce('user_registered');

    const result = controller.registerUser(dto);
    expect(mockNatsClientProxy.send).toHaveBeenCalledWith(
      'auth.register.user',
      dto,
    );
    expect(result).toBe('user_registered');
  });

  it('should login a user', () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: '123456',
    };

    mockNatsClientProxy.send.mockReturnValueOnce('user_logged_in');

    const result = controller.loginUser(dto);
    expect(mockNatsClientProxy.send).toHaveBeenCalledWith(
      'auth.login.user',
      dto,
    );
    expect(result).toBe('user_logged_in');
  });

  it('should logout a user', () => {
    const dto: LogoutUserDto = {
      token: 'some-token',
    };

    mockNatsClientProxy.send.mockReturnValueOnce('user_logged_out');

    const result = controller.logout(dto);
    expect(mockNatsClientProxy.send).toHaveBeenCalledWith(
      'auth.logout.user',
      dto,
    );
    expect(result).toBe('user_logged_out');
  });

  it('should verify token', () => {
    const dto: LogoutUserDto = {
      token: 'some-token',
    };

    mockNatsClientProxy.send.mockReturnValueOnce('token_valid');

    const result = controller.verifyToken(dto);
    expect(mockNatsClientProxy.send).toHaveBeenCalledWith(
      'auth.verify.user',
      dto,
    );
    expect(result).toBe('token_valid');
  });
});
