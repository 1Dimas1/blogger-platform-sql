import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  Like,
  LikeDocument,
  LikeModelType,
  LikeStatus,
} from '../domain/like.entity';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async findByUserAndParent(
    userId: string,
    parentId: string,
    parentType: 'comment' | 'post',
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      userId: new Types.ObjectId(userId),
      parentId: new Types.ObjectId(parentId),
      parentType,
    });
  }

  async findByParent(
    parentId: string,
    parentType: 'comment' | 'post',
  ): Promise<LikeDocument[]> {
    return this.LikeModel.find({
      parentId: new Types.ObjectId(parentId),
      parentType,
    });
  }

  async findNewestLikes(
    parentId: string,
    parentType: 'comment' | 'post',
    limit: number,
  ): Promise<LikeDocument[]> {
    return this.LikeModel.find({
      parentId: new Types.ObjectId(parentId),
      parentType,
      status: LikeStatus.Like,
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async delete(like: LikeDocument): Promise<void> {
    await like.deleteOne();
  }
}
