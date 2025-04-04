import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import * as joi from 'joi';

import { AwsSecretsService } from './aws-secrets.service';

@Injectable()
export class EnvsService implements OnModuleInit {
  private readonly logger = new Logger(EnvsService.name);
  private envConfig: Record<string, string> = {};

  constructor(private readonly secretsService: AwsSecretsService) {}

  async onModuleInit() {
    // this.logger.log(
    //   '✅ EnvsService inicializado. secretsService:',
    //   this.secretsService,
    // );
    // if (!this.secretsService) {
    //   throw new Error('❌ AwsSecretsService no fue inyectado correctamente.');
    // }

    await this.loadSecrets();
  }

  async loadSecrets(): Promise<void> {
    const rawString = await this.secretsService.getSecret(
      'client-gateway-secrets',
    );

    // this.logger.log('🔹 Secretos cargados en EnvsService:', rawString);

    if (!rawString) {
      throw new Error('Secrets are empty or undefined');
    }

    const cleanedString = rawString.replace(/^'{|}'$/g, '');

    const fixedJson = cleanedString.replace(
      /(\w+):([^,{}]+)/g,
      (match, key, value) => {
        if (!isNaN(Number(value))) {
          return `"${key}":${value}`;
        }
        return `"${key}":"${value}"`;
      },
    );

    // this.logger.log({ fixedJson });

    const parsedObject: Record<string, string> = JSON.parse(`{${fixedJson}}`);

    // this.logger.log({ parsedObject });

    const envsSchema = joi
      .object({
        PORT: joi.number().required(),
        NATS_SERVERS: joi.string().required(),
      })
      .unknown(true);

    const { error, value } = envsSchema.validate(parsedObject, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    this.envConfig = value;

    // console.log('EnvsService values: ', { value });
  }

  get(key: string): string {
    // console.log(`🔹 Buscando variable ${key}:`, key, this.envConfig);

    return this.envConfig[key];
  }
}
