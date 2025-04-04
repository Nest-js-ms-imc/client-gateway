import { validate } from 'class-validator';
import { RecordImcDto } from './record-imc.dto';

describe('RecordImcDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = new RecordImcDto();
    dto.height = 1.7;
    dto.weight = 70;
    dto.userId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if height is not a number', async () => {
    const dto = new RecordImcDto();
    dto.height = 'abc' as unknown as number;
    dto.weight = 70;
    dto.userId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail if height does not match the decimal pattern', async () => {
    const dto = new RecordImcDto();
    dto.height = 1.234;
    dto.weight = 70;
    dto.userId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    const heightError = errors.find((e) => e.property === 'height');
    expect(heightError).toBeDefined();

    expect(heightError?.constraints?.isFloatWithOneOrTwoDecimals).toBe(
      'The height field must be entered in meters (ej: 1.70 - 1.7)',
    );
  });

  it('should fail if weight is not a number', async () => {
    const dto = new RecordImcDto();
    dto.height = 1.7;
    dto.weight = 'abc' as unknown as number;
    dto.userId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail if userId is not a valid UUID', async () => {
    const dto = new RecordImcDto();
    dto.height = 1.7;
    dto.weight = 70;
    dto.userId = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });
});
