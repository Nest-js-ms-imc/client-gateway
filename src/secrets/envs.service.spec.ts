import { Test, TestingModule } from '@nestjs/testing';

import { EnvsService } from './envs.service';
import { AwsSecretsService } from './aws-secrets.service';

describe('EnvsService', () => {
  let envsService: EnvsService;
  let secretsServiceMock: jest.Mocked<AwsSecretsService>;

  beforeEach(async () => {
    secretsServiceMock = {
      getSecret: jest.fn(),
    } as unknown as jest.Mocked<AwsSecretsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvsService,
        { provide: AwsSecretsService, useValue: secretsServiceMock },
      ],
    }).compile();

    envsService = module.get<EnvsService>(EnvsService);
  });

  it('EnvsService should defined', () => {
    expect(envsService).toBeDefined();
  });

  const variables = `{"PORT";"3000","DB_USERNAME";"TEST_USERNAME","DB_PASSWORD";"TEST_PWD","DB_NAME";"TEST_DB","JWT_SECRET";"supersecret","DB_HOST";"localhost","DB_PORT";"54312","NATS_SERVERS";"nats://localhost:4222**nats://localhost:4223"}`;

  describe('loadSecrets', () => {
    it('should call loadSecrets in onModuleInit', async () => {
      secretsServiceMock.getSecret.mockResolvedValue(variables);

      await envsService.onModuleInit();
    });

    it('Should envConfig defined correctly', async () => {
      secretsServiceMock.getSecret.mockResolvedValue(variables);

      await envsService.loadSecrets();

      expect(envsService.get('PORT')).toBe(3000);
      expect(envsService.get('DB_HOST')).toBe('localhost');
    });

    it('Should throw error', async () => {
      secretsServiceMock.getSecret.mockResolvedValue('');

      await expect(envsService.loadSecrets()).rejects.toThrow(
        'Secrets are empty or undefined',
      );
    });

    it('Should throw error into config init', async () => {
      const mockSecret = `{"PORT";"isNotNumber"}`;

      secretsServiceMock.getSecret.mockResolvedValue(mockSecret);

      await expect(envsService.loadSecrets()).rejects.toThrow(
        'Config validation error: "PORT" must be a number. "NATS_SERVERS" is required',
      );
    });
  });

  describe('get', () => {
    it('should return the correct value of an environment variable', async () => {
      secretsServiceMock.getSecret.mockResolvedValue(variables);

      await envsService.loadSecrets();

      expect(envsService.get('DB_NAME')).toBe('TEST_DB');
    });

    it('should return undefined if the key does not exist', () => {
      expect(envsService.get('NON_EXISTENT_KEY')).toBeUndefined();
    });
  });
});
