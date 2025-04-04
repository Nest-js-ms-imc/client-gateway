import { IsUUID } from 'class-validator';

export class RecordsImcDomainDto {
  @IsUUID()
  id: string;
}
