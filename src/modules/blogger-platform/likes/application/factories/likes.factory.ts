import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, LikeModelType } from '../../domain/like.entity';
import { CreateLikeDomainDto } from '../../domain/dto/create-like.domain.dto';

@Injectable()
export class LikesFactory {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  create(dto: CreateLikeDomainDto): LikeDocument {
    return this.LikeModel.createInstance({
      userId: dto.userId,
      parentId: dto.parentId,
      parentType: dto.parentType,
      status: dto.status,
    });
  }
}
