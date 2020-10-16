import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import fetch, { Response } from 'node-fetch';

const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const dynamodb = process.env.JEST_WORKER_ID
    ? ((process as any).dynamodb as DynamoDB.DocumentClient)
    : new DynamoDB.DocumentClient(
        process.env.NODE_ENV == 'development'
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
  try {
    let res: Response = await fetch('https://formulae.brew.sh/api/formula.json');
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: res.statusText,
      };
    }
    let items: [{ PutRequest: { Item: DynamoDB.AttributeMap } }] = (await res.json()).map(
      (item: { [key: string]: any }) => {
        return {
          PutRequest: {
            Item: item,
          },
        };
      },
    );
    for (let i = 0; i < items.length; i += 25) {
      const params = {
        RequestItems: {
          BrewPlusFormulae: items.slice(i, i + 25),
        },
      };
      await dynamodb.batchWrite(params).promise();
    }

    res = await fetch('https://formulae.brew.sh/api/cask.json');
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: res.statusText,
      };
    }
    items = (await res.json()).map((item: { [key: string]: any }) => {
      return {
        PutRequest: {
          Item: item,
        },
      };
    });
    for (let i = 0; i < items.length; i += 25) {
      const params = {
        RequestItems: {
          BrewPlusCaskFormulae: items.slice(i, i + 25),
        },
      };
      await dynamodb.batchWrite(params).promise();
    }
    return {
      statusCode: 200,
      body: 'Success',
    };
  } catch (err) {
    return {
      statusCode: err.statusCode,
      body: err.code,
    };
  }
};

export { handler as default };
