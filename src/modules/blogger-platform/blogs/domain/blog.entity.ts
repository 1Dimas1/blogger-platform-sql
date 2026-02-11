import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

/**
 * Blog Entity Schema
 * This class represents the schema and behavior of a Blog entity.
 */
@Schema({ timestamps: true })
export class Blog {
  /**
   * Name of the blog
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
  name: string;

  /**
   * Description of the blog
   * @type {string}
   * @required
   * @maxLength 500
   */
  @Prop({
    type: String,
    required: true,
    maxlength: 500,
    trim: true,
  })
  description: string;

  /**
   * Website URL of the blog
   * @type {string}
   * @required
   * @maxLength 100
   */
  @Prop({
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
    match:
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  })
  websiteUrl: string;

  /**
   * Membership status of the blog
   * @type {boolean}
   * @default false
   */
  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;

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
   * Factory method to create a Blog instance
   * @param {CreateBlogDomainDto} dto - The data transfer object for blog creation
   * @returns {BlogDocument} The created blog document
   */
  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
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
   * Updates the blog instance with new data
   * @param {UpdateBlogDto} dto - The data transfer object for blog updates
   */
  update(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;
