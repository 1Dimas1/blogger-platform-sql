import { ApiProperty } from '@nestjs/swagger';
import { CommentDocument } from '../../domain/comment.entity';
import { LikeStatus } from '../../../likes/domain/like.entity';

export class LikesInfoViewDto {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty({ enum: LikeStatus })
  myStatus: LikeStatus;
}

export class CommentatorInfoViewDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}

export class CommentViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: CommentatorInfoViewDto })
  commentatorInfo: CommentatorInfoViewDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: LikesInfoViewDto })
  likesInfo: LikesInfoViewDto;

  static mapToView(
    comment: CommentDocument,
    likesInfo: LikesInfoViewDto,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId.toString(),
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = likesInfo;

    return dto;
  }
}
