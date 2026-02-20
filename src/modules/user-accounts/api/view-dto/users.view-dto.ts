import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  static mapToView(user: any): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id;
    dto.email = user.email;
    dto.login = user.login;
    dto.createdAt = new Date(user.created_at).toISOString();
    // dto.firstName = user.first_name;
    // dto.lastName = user.last_name;

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: any): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user.id;

    return dto;
  }
}
