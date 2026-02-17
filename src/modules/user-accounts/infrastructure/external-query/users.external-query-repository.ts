import { Injectable, NotFoundException } from '@nestjs/common';
import { UserExternalDto } from './external-dto/users.external-dto';
import { DbService } from '../../../../db/db.service';

// can be used in other services(blog,post,comment,etc)
@Injectable()
export class UsersExternalQueryRepository {
  constructor(private dbService: DbService) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalDto> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('user not found');
    }

    return UserExternalDto.mapToView(result.rows[0]);
  }
}
