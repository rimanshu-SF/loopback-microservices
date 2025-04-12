import { get, param, HttpErrors } from '@loopback/rest';
import { Client } from '@opensearch-project/opensearch';
import { authenticate, STRATEGY } from 'loopback4-authentication';
import { authorize } from 'loopback4-authorization';
import dotenv from 'dotenv';
import logger from '../services/logger.service';

// Load environment variables
dotenv.config();

// Initialize OpenSearch client
const client = new Client({
  node: process.env.OPENSEARCH_BASE_URL as string,
  maxRetries: 5,
  requestTimeout: 60000,
});

// Define the expected OpenSearch response type
interface SearchResponse<T> {
  body: {
    hits: {
      total: { value: number; relation: string };
      hits: Array<{
        _id: string;
        _source: T;
      }>;
    };
  };
}

// Define the log document structure
interface LogDocument {
  timestamp: string;
  level: string;
  message: string;
  route?: string;
  method?: string;
  error?: string;
  meta?: any;
}

export class LogController {
  constructor() {}

  @authenticate(STRATEGY.BEARER)
  @authorize({ permissions: ['GET_LOGS'] })
  @get('/logs')
  async getAllLogs(
    @param.query.number('size') size: number = 10,
    @param.query.number('from') from: number = 0,
  ): Promise<any> {
    try {
      const result: any = await client.search({
        index: 'bms-logs',
        size,
        from,
        body: {
          query: {
            match_all: {},
          },
          sort: [{ timestamp: { order: 'desc' } }], // Explicit sort syntax
        },
      });

      logger.info({
        message: 'Successfully retrieved all logs',
        route: '/logs',
        method: 'GET',
        timestamp: new Date().toISOString(),
        meta: { size, from },
      });

      return {
        total: result.body.hits.total.value,
        logs: result.body.hits.hits.map((hit: { _id: any; _source: any; }) => ({
          id: hit._id,
          ...hit._source,
        })),
      };
    } catch (error) {
      logger.error({
        message: 'Failed to retrieve logs',
        route: '/logs',
        method: 'GET',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
      throw new HttpErrors.InternalServerError(`Failed to retrieve logs: ${(error as Error).message}`);
    }
  }

}