import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, PipelineStage } from 'mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import {
  CommentViewDto,
  LikesInfoViewDto,
} from '../api/view-dto/comment.view-dto';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params.input-dto';
import { LikeStatus } from '../../likes/domain/like.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

interface CommentAggregatedDocument extends CommentDocument {
  likesInfo?: LikesInfoViewDto;
}

interface CommentPage {
  metadata: { totalCount: number }[];
  data: CommentAggregatedDocument[];
}

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const aggregationPipeline: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(id) } },
    ];

    this._addLikesAggregation(aggregationPipeline, userId);

    const result: CommentAggregatedDocument[] =
      await this.CommentModel.aggregate<CommentAggregatedDocument>(
        aggregationPipeline,
      ).exec();

    if (!result || result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    const comment: CommentAggregatedDocument = result[0];
    const likesInfo: LikesInfoViewDto = comment.likesInfo || {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    };

    return CommentViewDto.mapToView(comment, likesInfo);
  }

  async getAllByPostId(
    postId: string,
    query: GetCommentsQueryParams,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const sortOrder: 1 | -1 =
      query.sortDirection === SortDirection.Asc ? 1 : -1;

    const aggregationPipeline: PipelineStage[] = [
      { $match: { postId: new Types.ObjectId(postId) } },
    ];

    this._addLikesAggregation(aggregationPipeline, userId);

    aggregationPipeline.push(
      { $sort: { [query.sortBy]: sortOrder } as Record<string, 1 | -1> },
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          data: [{ $skip: query.calculateSkip() }, { $limit: query.pageSize }],
        },
      },
    );

    const results: CommentPage[] =
      await this.CommentModel.aggregate<CommentPage>(
        aggregationPipeline,
      ).exec();

    const totalCount: number = results[0]?.metadata[0]?.totalCount || 0;
    const comments: CommentAggregatedDocument[] = results[0]?.data || [];

    const items: CommentViewDto[] = comments.map(
      (comment: CommentAggregatedDocument): CommentViewDto => {
        const likesInfo: LikesInfoViewDto = comment.likesInfo || {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
        };
        return CommentViewDto.mapToView(comment, likesInfo);
      },
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  private _addLikesAggregation(
    pipeline: PipelineStage[],
    userId?: string | null,
  ): void {
    pipeline.push(
      {
        $lookup: {
          from: 'likes',
          let: { commentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$parentId', '$$commentId'] },
                    { $eq: ['$parentType', 'comment'] },
                  ],
                },
              },
            },
          ],
          as: 'likes',
        },
      },
      {
        $addFields: {
          likesInfo: {
            likesCount: {
              $size: {
                $filter: {
                  input: '$likes',
                  cond: { $eq: ['$$this.status', LikeStatus.Like] },
                },
              },
            },
            dislikesCount: {
              $size: {
                $filter: {
                  input: '$likes',
                  cond: { $eq: ['$$this.status', LikeStatus.Dislike] },
                },
              },
            },
            myStatus: {
              $ifNull: [
                {
                  $first: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$likes',
                          cond: userId
                            ? {
                                $eq: [
                                  '$$this.userId',
                                  new Types.ObjectId(userId),
                                ],
                              }
                            : { $eq: [1, 0] },
                        },
                      },
                      in: '$$this.status',
                    },
                  },
                },
                LikeStatus.None,
              ],
            },
          },
        },
      },
      {
        $project: {
          likes: 0,
        },
      },
    );
  }
}
