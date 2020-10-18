import { DynamoDB } from 'aws-sdk';
import BrewPlusFormulae from './brewplusformulae';

const dynamodb = process.env.JEST_WORKER_ID
  ? ((process as any).dynamodb as DynamoDB.DocumentClient)
  : new DynamoDB.DocumentClient(
      process.env.NODE_ENV === 'development'
        ? {
            region: 'us-east-1',
            credentials: {
              accessKeyId: 'dev',
              secretAccessKey: 'secret',
            },
            endpoint: 'http://localhost:8000',
          }
        : undefined,
    );

const BrewPlusFormulaeTable = new BrewPlusFormulae(dynamodb);

// eslint-disable-next-line import/prefer-default-export
export { BrewPlusFormulaeTable };
