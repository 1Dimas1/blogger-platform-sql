import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  SecurityDevice,
  SecurityDeviceDocument,
  SecurityDeviceModelType,
} from '../../domain/security-device.entity';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(SecurityDevice.name)
    private securityDeviceModel: SecurityDeviceModelType,
  ) {}

  /**
   * Get all active devices for a user
   */
  async getAllByUserId(userId: string): Promise<DeviceViewDto[]> {
    const devices: SecurityDeviceDocument[] = await this.securityDeviceModel
      .find({
        userId: new Types.ObjectId(userId),
        deletedAt: null,
      })
      .sort({ lastActiveDate: -1 })
      .exec();

    return devices.map((device) => DeviceViewDto.mapToView(device));
  }

  /**
   * Get device by deviceId or throw if not found
   */
  async getByDeviceIdOrNotFoundFail(deviceId: string): Promise<DeviceViewDto> {
    const device: SecurityDeviceDocument | null = await this.securityDeviceModel
      .findOne({ deviceId, deletedAt: null })
      .exec();

    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device session not found',
      });
    }

    return DeviceViewDto.mapToView(device);
  }
}
