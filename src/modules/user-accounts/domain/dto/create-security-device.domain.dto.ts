import { Types } from 'mongoose';

export class CreateSecurityDeviceDomainDto {
  userId: Types.ObjectId;
  deviceId: string;
  ip: string;
  title: string;
  expirationDate: Date;
  lastActiveDate?: number;
}
