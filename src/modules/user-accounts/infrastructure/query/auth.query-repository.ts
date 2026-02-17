import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DbService } from '../../../../db/db.service';

@Injectable()
export class AuthQueryRepository {
  constructor(private dbService: DbService) {}

  async me(userId: string): Promise<MeViewDto> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User not found',
      });
    }

    return MeViewDto.mapToView(result.rows[0]);
  }
}
