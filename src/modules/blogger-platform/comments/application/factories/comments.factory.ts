import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comment.entity';

export interface CreateCommentFactoryDto {
  content: string;
  userId: string;
  userLogin: string;
  postId: string;
}

@Injectable()
export class CommentsFactory {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async create(dto: CreateCommentFactoryDto): Promise<CommentDocument> {
    return this.CommentModel.createInstance({
      content: dto.content,
      commentatorInfo: {
        userId: dto.userId,
        userLogin: dto.userLogin,
      },
      postId: dto.postId,
    });
  }
}
