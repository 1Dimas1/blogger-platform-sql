import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Client } from 'pg';

export interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export const DATABASE_CONFIG = 'DATABASE_CONFIG';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor(@Inject(DATABASE_CONFIG) private dbConfig: DatabaseConfig) {}

  async onModuleInit() {
    this.client = new Client(this.dbConfig);

    try {
      await this.client.connect();
      console.log('Connected to PostgreSQL database');
    } catch (error) {
      console.error('Database connection error', error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.client.end();
    console.log('Disconnected from PostgreSQL database');
  }

  async query(queryString: string, params?: any[]) {
    return params
      ? this.client.query(queryString, params)
      : this.client.query(queryString);
  }
}
