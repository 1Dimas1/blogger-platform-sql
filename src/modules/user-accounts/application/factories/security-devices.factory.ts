import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevice,
  SecurityDeviceDocument,
  SecurityDeviceModelType,
} from '../../domain/security-device.entity';
import { CreateSecurityDeviceDomainDto } from '../../domain/dto/create-security-device.domain.dto';

@Injectable()
export class SecurityDevicesFactory {
  constructor(
    @InjectModel(SecurityDevice.name)
    private SecurityDeviceModel: SecurityDeviceModelType,
  ) {}

  create(dto: CreateSecurityDeviceDomainDto): SecurityDeviceDocument {
    return this.SecurityDeviceModel.createInstance(dto);
  }
}
