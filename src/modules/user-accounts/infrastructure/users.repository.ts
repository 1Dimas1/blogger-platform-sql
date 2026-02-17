import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { DbService } from '../../../db/db.service';

@Injectable()
export class UsersRepository {
  constructor(private dbService: DbService) {}

  private mapRowToEntity(row: any): User {
    const user = new User();
    user.id = row.id;
    user.login = row.login;
    user.passwordHash = row.password_hash;
    user.email = row.email;
    user.firstName = row.first_name;
    user.lastName = row.last_name;
    user.emailConfirmationCode = row.email_confirmation_code;
    user.emailConfirmationExpirationDate =
      row.email_confirmation_expiration_date
        ? new Date(row.email_confirmation_expiration_date)
        : null;
    user.emailIsConfirmed = row.email_is_confirmed;
    user.passwordRecoveryCode = row.password_recovery_code;
    user.passwordRecoveryExpirationDate = row.password_recovery_expiration_date
      ? new Date(row.password_recovery_expiration_date)
      : null;
    user.createdAt = new Date(row.created_at);
    user.updatedAt = new Date(row.updated_at);
    user.deletedAt = row.deleted_at ? new Date(row.deleted_at) : null;
    user.isNew = false;
    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async save(user: User): Promise<void> {
    if (user.isNew) {
      await this.dbService.query(
        `INSERT INTO users (
          id, login, password_hash, email, first_name, last_name,
          email_confirmation_code, email_confirmation_expiration_date, email_is_confirmed,
          password_recovery_code, password_recovery_expiration_date,
          created_at, updated_at, deleted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          user.id,
          user.login,
          user.passwordHash,
          user.email,
          user.firstName,
          user.lastName,
          user.emailConfirmationCode,
          user.emailConfirmationExpirationDate,
          user.emailIsConfirmed,
          user.passwordRecoveryCode,
          user.passwordRecoveryExpirationDate,
          user.createdAt,
          user.updatedAt,
          user.deletedAt,
        ],
      );
      user.isNew = false;
    } else {
      await this.dbService.query(
        `UPDATE users SET
          login = $2, password_hash = $3, email = $4, first_name = $5, last_name = $6,
          email_confirmation_code = $7, email_confirmation_expiration_date = $8, email_is_confirmed = $9,
          password_recovery_code = $10, password_recovery_expiration_date = $11,
          deleted_at = $12
        WHERE id = $1`,
        [
          user.id,
          user.login,
          user.passwordHash,
          user.email,
          user.firstName,
          user.lastName,
          user.emailConfirmationCode,
          user.emailConfirmationExpirationDate,
          user.emailIsConfirmed,
          user.passwordRecoveryCode,
          user.passwordRecoveryExpirationDate,
          user.deletedAt,
        ],
      );
    }
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return user;
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE login = $1 AND deleted_at IS NULL`,
      [login],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE email_confirmation_code = $1 AND deleted_at IS NULL`,
      [code],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByRecoveryCode(code: string): Promise<UserDocument | null> {
    const result = await this.dbService.query(
      `SELECT * FROM users WHERE password_recovery_code = $1 AND deleted_at IS NULL`,
      [code],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async loginIsExist(login: string): Promise<boolean> {
    const result = await this.dbService.query(
      `SELECT COUNT(*) FROM users WHERE login = $1 AND deleted_at IS NULL`,
      [login],
    );
    return parseInt(result.rows[0].count) > 0;
  }

  async emailIsExist(email: string): Promise<boolean> {
    const result = await this.dbService.query(
      `SELECT COUNT(*) FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    return parseInt(result.rows[0].count) > 0;
  }
}
