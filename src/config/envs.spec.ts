import * as joi from 'joi';

jest.mock('dotenv/config');

describe('Environment Variables Validation', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should load and validate environment variables correctly', async () => {
    process.env.PORT = '3000';
    process.env.AUTH_MICROSERVICE_HOST = 'localhost';
    process.env.AUTH_MICROSERVICE_PORT = '4000';
    process.env.IMC_MICROSERVICE_HOST = 'localhost';
    process.env.IMC_MICROSERVICE_PORT = '5000';
    process.env.NATS_SERVERS = 'nats://localhost:4222,nats://localhost:4223';

    const { envs } = await import('./envs');
    expect(envs).toEqual({
      port: 3000,
      authMicroserviceHost: 'localhost',
      authMicroservicePort: 4000,
      imcMicroserviceHost: 'localhost',
      imcMicroservicePort: 5000,
      natsServers: ['nats://localhost:4222', 'nats://localhost:4223'],
    });
  });

  it('should throw error if PORT is missing', () => {
    delete process.env.PORT;

    const schema = joi
      .object({
        PORT: joi.number().required(),
        DB_HOST: joi.string().required(),
        DB_NAME: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_PORT: joi.number().required(),
      })
      .unknown(true);

    const { error } = schema.validate(process.env);
    expect(error).toBeDefined();
  });
});
