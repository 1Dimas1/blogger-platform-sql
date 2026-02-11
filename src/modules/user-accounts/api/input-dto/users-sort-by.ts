import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class IdInputDTO {
  @ApiProperty()
  @IsMongoId()
  id: Types.ObjectId;
}
