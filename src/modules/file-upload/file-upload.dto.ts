import { PartialType } from "@nestjs/mapped-types";

export class CreateFileUploadDto {}

export class UpdateFileUploadDto extends PartialType(CreateFileUploadDto) {}
