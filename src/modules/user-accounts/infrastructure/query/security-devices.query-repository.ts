import { Injectable } from '@nestjs/common';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DbService } from '../../../../db/db.service';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(private dbService: DbService) {}

  async getAllByUserId(userId: string): Promise<DeviceViewDto[]> {
    const result = await this.dbService.query(
      `SELECT * FROM security_devices
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY last_active_date DESC`,
      [userId],
    );

    return result.rows.map((row) => DeviceViewDto.mapToView(row));
  }

  async getByDeviceIdOrNotFoundFail(deviceId: string): Promise<DeviceViewDto> {
    const result = await this.dbService.query(
      `SELECT * FROM security_devices WHERE device_id = $1 AND deleted_at IS NULL`,
      [deviceId],
    );

    if (result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device session not found',
      });
    }

    return DeviceViewDto.mapToView(result.rows[0]);
  }
}
