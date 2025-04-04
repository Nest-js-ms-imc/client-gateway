import { IsNumber, IsUUID, Matches } from 'class-validator';

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsFloatWithOneOrTwoDecimals(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFloatWithOneOrTwoDecimals',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return (
            typeof value === 'number' &&
            /^[0-9]\.\d{1,2}$/.test(value.toString())
          );
        },
      },
    });
  };
}

export class RecordImcDto {
  @IsNumber(
    {},
    { message: 'Must be a valid, positive number greater than zero' },
  )
  @IsFloatWithOneOrTwoDecimals({
    message: 'The height field must be entered in meters (ej: 1.70 - 1.7)',
  })
  height: number;

  @IsNumber()
  weight: number;

  @IsUUID()
  userId: string;
}
