import { Pool, PoolConfig, QueryResult as PgQueryResult, PoolClient } from 'pg';
import { logger } from '../../utils/logger';
import { config } from '../../config/app';
import { QueryResult } from '../types';

class PostgresqlClient {
  private pool: Pool;
  private static instance: PostgresqlClient;

  private constructor() {
    let poolConfig: PoolConfig;

    if (process.env.DATABASE_URL) {
      poolConfig = {
        connectionString: process.env.DATABASE_URL,
        max: config.database.poolMax,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      };
    } else {
      poolConfig = {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        max: config.database.poolMax,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      };
    }

    this.pool = new Pool(poolConfig);

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    // Test the connection
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      logger.info('Successfully connected to PostgreSQL database');
      client.release();
    } catch (error) {
      logger.error('Failed to connect to PostgreSQL database', error);
      throw error;
    }
  }

  public static getInstance(): PostgresqlClient {
    if (!PostgresqlClient.instance) {
      PostgresqlClient.instance = new PostgresqlClient();
    }

    return PostgresqlClient.instance;
  }

  public async query<T>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    const start = Date.now();

    try {
      const result: PgQueryResult = await this.pool.query(text, params);

      const duration = Date.now() - start;
      if (config.database.debug) {
        logger.debug(`Executed query: ${text} (${duration}ms)`, { params });
      }

      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
      };
    } catch (error) {
      logger.error(`Query error: ${text}`, { params, error });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async end(): Promise<void> {
    await this.pool.end();
  }
}

// Export a singleton instance
export const db = PostgresqlClient.getInstance();
