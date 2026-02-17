import { ApiProperty } from '@nestjs/swagger';

export class DeviceViewDto {
  @ApiProperty({
    description: 'IP address of device during signing in',
    example: '192.168.1.1',
  })
  ip: string;

  @ApiProperty({
    description:
      'Device name: for example Chrome 105 (received by parsing http header "user-agent")',
    example: 'Chrome 105',
  })
  title: string;

  @ApiProperty({
    description: 'Date of the last generating of refresh/access tokens',
    example: '2024-01-15T10:30:00.000Z',
  })
  lastActiveDate: string;

  @ApiProperty({
    description: 'Id of connected device session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  deviceId: string;

  static mapToView(device: any): DeviceViewDto {
    return {
      ip: device.ip,
      title: device.title,
      lastActiveDate: new Date(device.last_active_date * 1000).toISOString(),
      deviceId: device.device_id,
    };
  }
}
