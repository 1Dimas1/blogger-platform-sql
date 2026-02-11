import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
} from './extended-likes-info.schema';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { Constants } from '../../../../core/constants';

/**
 * Post Entity Schema
 * This class represents the schema and behavior of a Post entity.
 */
@Schema({ timestamps: true })
export class Post {
  /**
   * Title of the post
   * @type {string}
   * @required
   * @maxLength 30
   */
  @Prop({
    type: String,
    required: true,
    maxlength: 30,
  })
  title: string;

  /**
   * Short description of the post
   * @type {string}
   * @required
   * @maxLength 100
   */
  @Prop({
    type: String,
    required: true,
    maxlength: 100,
  })
  shortDescription: string;

  /**
   * Content of the post
   * @type {string}
   * @required
   * @maxLength 1000
   */
  @Prop({
    type: String,
    required: true,
    maxlength: 1000,
  })
  content: string;

  /**
   * Reference to the blog this post belongs to
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({
    type: Types.ObjectId,
    ref: Constants.BLOG_COLLECTION_NAME,
    required: true,
  })
  blogId: Types.ObjectId;

  /**
   * Name of the blog (denormalized for performance)
   * @type {string}
   * @required
   * @maxLength 15
   */
  @Prop({
    type: String,
    required: true,
    maxlength: 15,
    trim: true,
  })
  blogName: string;

  /**
   * Extended likes information for the post
   * @type {ExtendedLikesInfo}
   * @required
   */
  @Prop({
    type: ExtendedLikesInfoSchema,
    required: true,
    default: () => ({
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    }),
  })
  extendedLikesInfo: ExtendedLikesInfo;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   */
  createdAt: Date;
  updatedAt: Date;

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   */
  get id(): string {
    // @ts-ignore
    return this._id.toString();
  }

  /**
   * Factory method to create a Post instance
   * @param {CreatePostDomainDto} dto - The data transfer object for post creation
   * @returns {PostDocument} The created post document
   */
  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = new Types.ObjectId(dto.blogId);
    post.blogName = dto.blogName;
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    return post as PostDocument;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  /**
   * Updates the post instance with new data
   * @param {UpdatePostDto} dto - The data transfer object for post updates
   */
  update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    if (dto.blogId) {
      this.blogId = new Types.ObjectId(dto.blogId);
    }
  }

  /**
   * Updates the extended likes information
   * @param {ExtendedLikesInfo} likesInfo - The new likes information
   */
  updateLikesInfo(likesInfo: ExtendedLikesInfo) {
    this.extendedLikesInfo = likesInfo;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
