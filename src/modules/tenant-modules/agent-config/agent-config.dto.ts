import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { AgentGender, AgentTone } from '../../../common/enums/agent.enum';
import { PartialType } from '@nestjs/mapped-types';


export class CreateAgentConfigDto {
  @IsEnum(AgentTone)
  @IsNotEmpty()
  tone: AgentTone;

  @IsEnum(AgentGender)
  @IsNotEmpty()
  gender: AgentGender;

  @IsString()
  @IsNotEmpty()
  openingScript: string;

  @IsString()
  @IsNotEmpty()
  endingScript: string;
}

export class UpdateAgentConfigDto extends PartialType(CreateAgentConfigDto) {}