import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostDocument } from '../../domain/post.entity';
import {
  ExtendedLikesInfo,
  LikeDetails,
} from '../../domain/extended-likes-info.schema';

export class UpdatePostLikesInfoCommand {
  constructor(
    public postId: string,
    public likesCount: number,
    public dislikesCount: number,
    public newestLikes: LikeDetails[],
  ) {}
}

@CommandHandler(UpdatePostLikesInfoCommand)
export class UpdatePostLikesInfoUseCase
  implements ICommandHandler<UpdatePostLikesInfoCommand, void>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({
    postId,
    likesCount,
    dislikesCount,
    newestLikes,
  }: UpdatePostLikesInfoCommand): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.findOrNotFoundFail(postId);

    const extendedLikesInfo: ExtendedLikesInfo = {
      likesCount,
      dislikesCount,
      newestLikes,
    };

    post.updateLikesInfo(extendedLikesInfo);

    await this.postsRepository.save(post);
  }
}
