import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentator-info.schema';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

/**
 * Comment Entity Schema
 * This class represents the schema and behavior of a Comment entity.
 */
@Schema({ timestamps: true })
export class Comment {
  /**
   * Content of the comment
   * @type {string}
   * @required
   * @minLength 20
   * @maxLength 300
   */
  @Prop({
    type: String,
    required: true,
    minlength: 20,
    maxlength: 300,
  })
  content: string;

  /**
   * Information about the commentator
   * @type {CommentatorInfo}
   * @required
   */
  @Prop({
    type: CommentatorInfoSchema,
    required: true,
  })
  commentatorInfo: CommentatorInfo;

  /**
   * Reference to the post this comment belongs to
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'Post',
    required: true,
  })
  postId: Types.ObjectId;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   */
  createdAt: Date;
  updatedAt: Date;

  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   */
  get id(): string {
    // @ts-ignore
    return this._id.toString();
  }

  /**
   * Factory method to create a Comment instance
   * @param {CreateCommentDomainDto} dto - The data transfer object for comment creation
   * @returns {CommentDocument} The created comment document
   */
  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.commentatorInfo = {
      userId: new Types.ObjectId(dto.commentatorInfo.userId),
      userLogin: dto.commentatorInfo.userLogin,
    };
    comment.postId = new Types.ObjectId(dto.postId);

    return comment as CommentDocument;
  }

  /**
   * Updates the comment instance with new data
   * @param {UpdateCommentDto} dto - The data transfer object for comment updates
   */
  update(dto: UpdateCommentDto) {
    this.content = dto.content;
  }

  /**
   * Checks if the comment belongs to the specified user
   * @param {string} userId - The user ID to check ownership
   * @returns {boolean} True if the comment belongs to the user
   */
  isOwnedBy(userId: string): boolean {
    return this.commentatorInfo.userId.toString() === userId;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
