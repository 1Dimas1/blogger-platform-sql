import { v4 as uuidv4 } from 'uuid';
import { CreateSecurityDeviceDomainDto } from './dto/create-security-device.domain.dto';

export class SecurityDevice {
  id: string;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: number;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  isNew: boolean;

  static createInstance(dto: CreateSecurityDeviceDomainDto): SecurityDevice {
    const device = new SecurityDevice();
    device.id = uuidv4();
    device.userId = dto.userId;
    device.deviceId = dto.deviceId;
    device.ip = dto.ip;
    device.title = dto.title;
    device.lastActiveDate = dto.lastActiveDate ?? Math.floor(Date.now() / 1000);
    device.expirationDate = dto.expirationDate;
    device.createdAt = new Date();
    device.updatedAt = new Date();
    device.deletedAt = null;
    device.isNew = true;
    return device;
  }

  updateLastActiveDate(iat: number): void {
    this.lastActiveDate = iat;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Device session already deleted');
    }
    this.deletedAt = new Date();
  }
}

export type SecurityDeviceDocument = SecurityDevice;
