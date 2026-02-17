export class UserExternalDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  firstName: string | null;
  lastName: string | null;

  static mapToView(row: any): UserExternalDto {
    const dto = new UserExternalDto();

    dto.id = row.id;
    dto.email = row.email;
    dto.login = row.login;
    dto.createdAt = new Date(row.created_at);
    dto.firstName = row.first_name;
    dto.lastName = row.last_name;

    return dto;
  }
}
