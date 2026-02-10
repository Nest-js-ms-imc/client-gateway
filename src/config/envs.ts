import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  AUTH_MICROSERVICE_HOST: string;
  AUTH_MICROSERVICE_PORT: number;
  IMC_MICROSERVICE_HOST: string;
  IMC_MICROSERVICE_PORT: number;
  NATS_SERVERS: string[];
  NODE_ENV: 'dev' | 'prod';
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    AUTH_MICROSERVICE_HOST: joi.string().required(),
    AUTH_MICROSERVICE_PORT: joi.number().required(),
    IMC_MICROSERVICE_HOST: joi.string().required(),
    IMC_MICROSERVICE_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    NODE_ENV: joi.string().valid('dev', 'prod', 'test').required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

// if (error) throw new Error(`Config validation error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  authMicroserviceHost: envVars.AUTH_MICROSERVICE_HOST,
  authMicroservicePort: envVars.AUTH_MICROSERVICE_PORT,
  imcMicroserviceHost: envVars.IMC_MICROSERVICE_HOST,
  imcMicroservicePort: envVars.IMC_MICROSERVICE_PORT,
  natsServers: envVars.NATS_SERVERS,
  nodeEnv: envVars.NODE_ENV,
};
