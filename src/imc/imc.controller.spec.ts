import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from './imc.controller';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RecordImcDto, RecordsImcDomainDto } from './dto';
import { NatsClientProxy } from '../services';

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
    const dto: RecordImcDto = { userId: '123', weight: 70, height: 1.75 };
    controller.newRecordImc(dto);

    expect(mockNatsClientProxy.send).toHaveBeenCalledWith(
      'imc.new.record',
      dto,
    );
  });

  it('should call natsClientProxy.send on listImcRecords', () => {
    const dto: RecordsImcDomainDto = { id: '123' };
    controller.listImcRecords(dto);

    expect(mockNatsClientProxy.send).toHaveBeenCalledWith(
      'imc.list.records',
      dto,
    );
  });
});
