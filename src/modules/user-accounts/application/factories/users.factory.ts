import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../services/crypto.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersFactory {
  constructor(
    private readonly cryptoService: CryptoService,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const passwordHash: string = await this.createPasswordHash(dto);
    const user: UserDocument = this.createUserInstance(dto, passwordHash);

    return user;
  }

  private async createPasswordHash(dto: CreateUserDto): Promise<string> {
    const passwordHash: string = await this.cryptoService.createPasswordHash(
      dto.password,
    );
    return passwordHash;
  }

  private createUserInstance(dto: CreateUserDto, passwordHash: string) {
    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    return user;
  }
}
