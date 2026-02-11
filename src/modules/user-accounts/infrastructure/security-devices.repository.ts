import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  SecurityDevice,
  SecurityDeviceDocument,
  SecurityDeviceModelType,
} from '../domain/security-device.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevice.name)
    private securityDeviceModel: SecurityDeviceModelType,
  ) {}

  /**
   * Find a device by deviceId
   */
  async findByDeviceId(
    deviceId: string,
  ): Promise<SecurityDeviceDocument | null> {
    return this.securityDeviceModel
      .findOne({ deviceId: deviceId, deletedAt: null })
      .exec();
  }

  /**
   * Find a device by deviceId or throw DomainException if not found
   */
  async findOrNotFoundFail(deviceId: string): Promise<SecurityDeviceDocument> {
    const device: SecurityDeviceDocument | null =
      await this.findByDeviceId(deviceId);
    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device session not found',
      });
    }
    return device;
  }

  /**
   * Save a device (insert or update)
   */
  async save(device: SecurityDeviceDocument): Promise<void> {
    await device.save();
  }

  /**
   * Delete all devices for a user except the specified one
   */
  async deleteAllUserDevicesExcept(
    userId: Types.ObjectId,
    currentDeviceId: string,
  ): Promise<void> {
    await this.securityDeviceModel
      .updateMany(
        {
          userId,
          deviceId: { $ne: currentDeviceId },
          deletedAt: null,
        },
        {
          $set: { deletedAt: new Date() },
        },
      )
      .exec();
  }
}
