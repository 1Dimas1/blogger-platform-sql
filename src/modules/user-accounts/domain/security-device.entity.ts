import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateSecurityDeviceDomainDto } from './dto/create-security-device.domain.dto';
import { Constants } from '../../../core/constants';

@Schema({
  timestamps: true,
  collection: Constants.SECURITY_DEVICES_COLLECTION_NAME,
})
export class SecurityDevice {
  @Prop({
    type: Types.ObjectId,
    ref: Constants.USER_COLLECTION_NAME,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  lastActiveDate: number;

  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  /**
   * Static factory method to create a new SecurityDevice instance
   */
  static createInstance(
    dto: CreateSecurityDeviceDomainDto,
  ): SecurityDeviceDocument {
    const device = new this();
    device.userId = dto.userId;
    device.deviceId = dto.deviceId;
    device.ip = dto.ip;
    device.title = dto.title;
    device.lastActiveDate = dto.lastActiveDate ?? Math.floor(Date.now() / 1000);
    device.expirationDate = dto.expirationDate;
    device.deletedAt = null;
    return device as SecurityDeviceDocument;
  }

  /**
   * Business logic: Update the last active date
   */
  updateLastActiveDate(iat: number): void {
    this.lastActiveDate = iat;
  }

  /**
   * Business logic: Soft delete the device session
   */
  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Device session already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const SecurityDeviceSchema =
  SchemaFactory.createForClass(SecurityDevice);
SecurityDeviceSchema.loadClass(SecurityDevice);

export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;
export type SecurityDeviceModelType = Model<SecurityDeviceDocument> &
  typeof SecurityDevice;
