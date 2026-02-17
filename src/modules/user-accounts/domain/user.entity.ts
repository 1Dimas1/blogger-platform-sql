import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]+$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

export class User {
  id: string;
  login: string;
  passwordHash: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailConfirmationCode: string | null;
  emailConfirmationExpirationDate: Date | null;
  emailIsConfirmed: boolean;
  passwordRecoveryCode: string | null;
  passwordRecoveryExpirationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  isNew: boolean;

  static createInstance(dto: CreateUserDomainDto): User {
    const user = new User();
    user.id = uuidv4();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.firstName = dto.firstName ?? null;
    user.lastName = dto.lastName ?? null;
    user.emailConfirmationCode = null;
    user.emailConfirmationExpirationDate = null;
    user.emailIsConfirmed = false;
    user.passwordRecoveryCode = null;
    user.passwordRecoveryExpirationDate = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.deletedAt = null;
    user.isNew = true;
    return user;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.emailIsConfirmed = false;
      this.email = dto.email;
    }
  }

  setConfirmationCode(code: string, expirationDate: Date) {
    this.emailConfirmationCode = code;
    this.emailConfirmationExpirationDate = expirationDate;
    this.emailIsConfirmed = false;
  }

  confirmEmail() {
    this.emailIsConfirmed = true;
    this.emailConfirmationCode = null;
    this.emailConfirmationExpirationDate = null;
  }

  setPasswordRecoveryCode(code: string, expirationDate: Date) {
    this.passwordRecoveryCode = code;
    this.passwordRecoveryExpirationDate = expirationDate;
  }

  clearPasswordRecoveryCode() {
    this.passwordRecoveryCode = null;
    this.passwordRecoveryExpirationDate = null;
  }

  updatePassword(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
    this.clearPasswordRecoveryCode();
  }

  isEmailConfirmationExpired(): boolean {
    if (!this.emailConfirmationExpirationDate) return false;
    return new Date() > this.emailConfirmationExpirationDate;
  }

  isPasswordRecoveryExpired(): boolean {
    if (!this.passwordRecoveryExpirationDate) return false;
    return new Date() > this.passwordRecoveryExpirationDate;
  }
}

export type UserDocument = User;
