import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import fetch, { Response } from 'node-fetch';

const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    endpoint: 'http://localhost:8000',
  });
  try {
    let res: Response = await fetch('https://formulae.brew.sh/api/formula.json');
    if (!res.ok) {
      return new Response(`${res.statusText}`, { status: res.status });
    }
    const items: [{ PutRequest: { Item: AWS.DynamoDB.AttributeMap } }] = (await res.json()).map(
      (item: { [key: string]: any }) => {
        const result = AWS.DynamoDB.Converter.input(item);
        const name = item.name;
        const full_name = item.full_name;
        return {
          PutRequest: {
            Item: {
              name,
              full_name,
              result,
            },
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
