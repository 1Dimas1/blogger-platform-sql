import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';

@Injectable()
export class TestingService {
  constructor(private readonly dbService: DbService) {}

  async deleteAllData() {
    await this.dbService.query(
      `TRUNCATE TABLE likes, comments, posts, blogs, security_devices, users CASCADE`,
    );

    return {
      status: 'succeeded',
    };
  }
}
