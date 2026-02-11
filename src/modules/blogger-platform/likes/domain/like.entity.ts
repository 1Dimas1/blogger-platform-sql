import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { Constants } from '../../../../core/constants';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

/**
 * Like Entity Schema
 * This class represents the schema and behavior of a Like entity.
 */
@Schema({ timestamps: true })
export class Like {
  /**
   * Reference to the user who created the like
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({
    type: Types.ObjectId,
    ref: Constants.USER_COLLECTION_NAME,
    required: true,
  })
  userId: Types.ObjectId;

  /**
   * Reference to the parent entity (post or comment)
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  parentId: Types.ObjectId;

  /**
   * Type of the parent entity
   * @type {'comment' | 'post'}
   * @required
   */
  @Prop({
    type: String,
    required: true,
    enum: ['comment', 'post'],
  })
  parentType: 'comment' | 'post';

  /**
   * Status of the like
   * @type {LikeStatus}
   * @required
   */
  @Prop({
    type: String,
    required: true,
    enum: Object.values(LikeStatus),
  })
  status: LikeStatus;

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
   * Factory method to create a Like instance
   * @param {CreateLikeDomainDto} dto - The data transfer object for like creation
   * @returns {LikeDocument} The created like document
   */
  static createInstance(dto: CreateLikeDomainDto): LikeDocument {
    const like = new this();
    like.userId = new Types.ObjectId(dto.userId);
    like.parentId = new Types.ObjectId(dto.parentId);
    like.parentType = dto.parentType;
    like.status = dto.status;

    return like as LikeDocument;
  }

  /**
   * Updates the like status
   * @param {LikeStatus} status - The new like status
   */
  updateStatus(status: LikeStatus) {
    this.status = status;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Create unique compound index
LikeSchema.index({ userId: 1, parentId: 1, parentType: 1 }, { unique: true });

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
