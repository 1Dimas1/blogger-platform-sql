import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Constants } from '../../../../core/constants';

@Schema({ _id: false })
export class LikeDetails {
  @Prop({ type: Date, required: true })
  addedAt: Date;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Constants.USER_COLLECTION_NAME,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  login: string;
}

export const LikeDetailsSchema = SchemaFactory.createForClass(LikeDetails);

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({ type: [LikeDetailsSchema], required: true, default: [] })
  newestLikes: LikeDetails[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);
