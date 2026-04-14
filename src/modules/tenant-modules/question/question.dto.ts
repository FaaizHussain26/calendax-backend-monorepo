import {
  IsString, IsOptional, IsUUID,
  IsEnum, IsBoolean, IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { QuestionStatus } from '../../../common/enums/question.enum';

export class CreateQuestionDto {
  @IsUUID()
  protocolId: string;

  @IsUUID()
  documentId: string; 

  @IsString()
  question: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  indication?: string;
}

export class CreateBulkQuestionsDto {
  @IsUUID()
  protocolId: string;

  @IsUUID()
  documentId: string;

}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsEnum(QuestionStatus)
  @IsOptional()
  status?: QuestionStatus;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsString()
  @IsOptional()
  answer?: string;
}

export class ListQuestionsQueryDto extends PaginationDto {
  @IsUUID()
  @IsOptional()
  protocolId?: string;

  @IsUUID()
  @IsOptional()
  documentId?: string;

  @IsEnum(QuestionStatus)
  @IsOptional()
  status?: QuestionStatus;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}
export class GenerateQuestionDto {
  @IsUUID()
  protocolId: string;

  @IsUUID()
  documentId: string;

  @IsString()
  @IsOptional()
  indication?: string;

  @IsString()
  @IsOptional()
  additionalContext?: string;
}