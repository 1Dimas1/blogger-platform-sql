import { Injectable } from '@nestjs/common';
import {
  SecurityDevice,
  SecurityDeviceDocument,
} from '../domain/security-device.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { DbService } from '../../../db/db.service';

@Injectable()
export class SecurityDevicesRepository {
  constructor(private dbService: DbService) {}

  private mapRowToEntity(row: any): SecurityDevice {
    const device = new SecurityDevice();
    device.id = row.id;
    device.userId = row.user_id;
    device.deviceId = row.device_id;
    device.ip = row.ip;
    device.title = row.title;
    device.lastActiveDate = row.last_active_date;
    device.expirationDate = new Date(row.expiration_date);
    device.createdAt = new Date(row.created_at);
    device.updatedAt = new Date(row.updated_at);
    device.deletedAt = row.deleted_at ? new Date(row.deleted_at) : null;
    device.isNew = false;
    return device;
  }

  async findByDeviceId(
    deviceId: string,
  ): Promise<SecurityDeviceDocument | null> {
    const result = await this.dbService.query(
      `SELECT * FROM security_devices WHERE device_id = $1 AND deleted_at IS NULL`,
      [deviceId],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findOrNotFoundFail(deviceId: string): Promise<SecurityDeviceDocument> {
    const device = await this.findByDeviceId(deviceId);
    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device session not found',
      });
    }
    return device;
  }

  async save(device: SecurityDevice): Promise<void> {
    if (device.isNew) {
      await this.dbService.query(
        `INSERT INTO security_devices (
          id, user_id, device_id, ip, title, last_active_date, expiration_date,
          created_at, updated_at, deleted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          device.id,
          device.userId,
          device.deviceId,
          device.ip,
          device.title,
          device.lastActiveDate,
          device.expirationDate,
          device.createdAt,
          device.updatedAt,
          device.deletedAt,
        ],
      );
      device.isNew = false;
    } else {
      await this.dbService.query(
        `UPDATE security_devices SET
          ip = $2, title = $3, last_active_date = $4, expiration_date = $5,
          deleted_at = $6
        WHERE id = $1`,
        [
          device.id,
          device.ip,
          device.title,
          device.lastActiveDate,
          device.expirationDate,
          device.deletedAt,
        ],
      );
    }
  }

  async deleteAllUserDevicesExcept(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await this.dbService.query(
      `UPDATE security_devices SET deleted_at = NOW()
       WHERE user_id = $1 AND device_id != $2 AND deleted_at IS NULL`,
      [userId, currentDeviceId],
    );
  }
}
