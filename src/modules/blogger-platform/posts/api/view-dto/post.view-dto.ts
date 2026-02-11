import { ApiProperty } from '@nestjs/swagger';
import { PostDocument } from '../../domain/post.entity';
import { LikeStatus } from '../../../likes/domain/like.entity';

export class LikeDetailsViewDto {
  @ApiProperty()
  addedAt: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  login: string;
}

export class ExtendedLikesInfoViewDto {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty({ enum: LikeStatus })
  myStatus: LikeStatus;

  @ApiProperty({ type: [LikeDetailsViewDto] })
  newestLikes: LikeDetailsViewDto[];
}

export class PostViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ExtendedLikesInfoViewDto })
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToView(
    post: PostDocument,
    myStatus: LikeStatus = LikeStatus.None,
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    const newestLikes: LikeDetailsViewDto[] =
      post.extendedLikesInfo.newestLikes.map((like) => ({
        addedAt: like.addedAt.toISOString(),
        userId: like.userId.toString(),
        login: like.login,
      }));

    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
