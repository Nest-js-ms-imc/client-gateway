import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from './imc.controller';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RecordImcDto, RecordsImcDomainDto } from './dto';
import { NatsClientProxy } from '../services';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';

describe('ImcController', () => {
  let controller: ImcController;
  let mockNatsClientProxy: Partial<NatsClientProxy>;
  let mockClientProxy: Partial<ClientProxy>;

  beforeEach(async () => {
    mockNatsClientProxy = {
      send: jest.fn().mockImplementation(() => ({ toPromise: jest.fn() })),
    };

    mockClientProxy = {
      send: jest.fn().mockImplementation(() => ({ toPromise: jest.fn() })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImcController],
      providers: [
        { provide: NatsClientProxy, useValue: mockNatsClientProxy },
        { provide: NATS_SERVICE, useValue: mockClientProxy },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ImcController>(ImcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call natsClientProxy.send on newRecordImc', () => {
    const dto: RecordImcDto = { weight: 70, height: 1.75 };
    const currentUser: CurrentUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };

    controller.newRecordImc(dto, currentUser);

    expect(mockNatsClientProxy.send).toHaveBeenCalledWith('imc.new.record', {
      weight: 70,
      height: 1.75,
      userId: currentUser.id,
    });
  });

  it('should call natsClientProxy.send on listImcRecords', () => {
    const currentUser: CurrentUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };
    controller.listImcRecords(currentUser);

    expect(mockNatsClientProxy.send).toHaveBeenCalledWith('imc.list.records', {
      id: currentUser.id,
    });
  });
});
