import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DbService } from '../../../../db/db.service';
import { UsersSortBy } from '../../api/input-dto/users-sort-by';

const sortByColumnMap: Record<UsersSortBy, string> = {
  [UsersSortBy.CreatedAt]: 'created_at',
  [UsersSortBy.Login]: 'login',
  [UsersSortBy.Email]: 'email',
};

@Injectable()
export class UsersQueryRepository {
  constructor(private dbService: DbService) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return UserViewDto.mapToView(result.rows[0]);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    const orConditions: string[] = [];

    if (query.searchLoginTerm) {
      orConditions.push(`login ILIKE $${paramIndex}`);
      params.push(`%${query.searchLoginTerm}%`);
      paramIndex++;
    }

    if (query.searchEmailTerm) {
      orConditions.push(`email ILIKE $${paramIndex}`);
      params.push(`%${query.searchEmailTerm}%`);
      paramIndex++;
    }

    if (orConditions.length > 0) {
      conditions.push(`(${orConditions.join(' OR ')})`);
    }

    const whereClause = conditions.join(' AND ');
    const sortColumn = sortByColumnMap[query.sortBy] || 'created_at';
    const sortDirection = query.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await this.dbService.query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      params,
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const itemsResult = await this.dbService.query(
      `SELECT * FROM users WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, query.pageSize, query.calculateSkip()],
    );

    const items: UserViewDto[] = itemsResult.rows.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
