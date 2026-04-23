import { IsNumber } from 'class-validator';

export class UpdatePageIndexDto {
  @IsNumber()
  currentIndex: number;
  @IsNumber()
  newIndex: number;
}
