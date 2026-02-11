import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Types, PipelineStage } from 'mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { LikeStatus } from '../../likes/domain/like.entity';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

interface PostAggregatedDocument extends PostDocument {
  myStatus?: LikeStatus;
}

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const filter: FilterQuery<Post> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const aggregationPipeline: PipelineStage[] = [{ $match: filter }];

    if (userId) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: 'likes',
            let: { postId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$parentId', '$$postId'] },
                      { $eq: ['$parentType', 'post'] },
                      { $eq: ['$userId', new Types.ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: 'userLike',
          },
        },
        {
          $addFields: {
            myStatus: {
              $ifNull: [
                { $arrayElemAt: ['$userLike.status', 0] },
                LikeStatus.None,
              ],
            },
          },
        },
      );
    } else {
      aggregationPipeline.push({
        $addFields: {
          myStatus: LikeStatus.None,
        },
      });
    }

    const result: PostAggregatedDocument[] =
      await this.PostModel.aggregate<PostAggregatedDocument>(
        aggregationPipeline,
      ).exec();

    if (!result || result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    const post: PostAggregatedDocument = result[0];
    return PostViewDto.mapToView(post, post.myStatus || LikeStatus.None);
  }

  async getAll(
    query: GetPostsQueryParams,
    userId?: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    return this._getPostsWithAggregation(filter, query, userId);
  }

  async getAllByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      blogId: new Types.ObjectId(blogId),
      deletedAt: null,
    };

    return this._getPostsWithAggregation(filter, query, userId);
  }

  private async _getPostsWithAggregation(
    filter: FilterQuery<Post>,
    query: GetPostsQueryParams,
    userId?: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortDir: 1 | -1 = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const aggregationPipeline: PipelineStage[] = [{ $match: filter }];

    if (userId) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: 'likes',
            let: { postId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$parentId', '$$postId'] },
                      { $eq: ['$parentType', 'post'] },
                      { $eq: ['$userId', new Types.ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: 'userLike',
          },
        },
        {
          $addFields: {
            myStatus: {
              $ifNull: [
                { $arrayElemAt: ['$userLike.status', 0] },
                LikeStatus.None,
              ],
            },
          },
        },
      );
    } else {
      aggregationPipeline.push({
        $addFields: {
          myStatus: LikeStatus.None,
        },
      });
    }

    aggregationPipeline.push(
      { $sort: { [query.sortBy]: sortDir } as Record<string, 1 | -1> },
      { $skip: query.calculateSkip() },
      { $limit: query.pageSize },
    );

    const posts: PostAggregatedDocument[] =
      await this.PostModel.aggregate<PostAggregatedDocument>(
        aggregationPipeline,
      ).exec();
    const totalCount: number = await this.PostModel.countDocuments(filter);

    const items: PostViewDto[] = posts.map((post) =>
      PostViewDto.mapToView(post, post.myStatus || LikeStatus.None),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
