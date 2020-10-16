import { DynamoDB } from 'aws-sdk';
import fetch, { Response } from 'node-fetch';

class BrewPlusFormulae {
  dynamodb: DynamoDB.DocumentClient;

  constructor(dynamodb: DynamoDB.DocumentClient) {
    this.dynamodb = dynamodb;
  }

  async handleCron(tableName: string, primaryKey: string, url: string, indexName?: string) {
    const res: Response = await fetch(url);
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: res.statusText,
      };
    }
    const names = new Set<string>();
    const items: [{ PutRequest: { Item: DynamoDB.AttributeMap } }] = (await res.json()).map(
      (item: { [key: string]: any }) => {
        names.add(item[primaryKey]);
        return {
          PutRequest: {
            Item: item,
          },
        };
      },
    );

    const params: any = {
      TableName: tableName,
      IndexName: indexName,
    };
    const result = (await this.dynamodb.scan(params).promise()).Items;

    if (result) {
      for (const entry of result) {
        if (!names.has(entry[primaryKey])) {
          const params = {
            TableName: tableName,
            Key: {
              name: entry[primaryKey],
            },
          };
          this.dynamodb.delete(params);
        }
      }
    }

    for (let i = 0; i < items.length; i += 25) {
      const params = {
        RequestItems: {
          [tableName]: items.slice(i, i + 25),
        },
      };
      await this.dynamodb.batchWrite(params).promise();
    }
  }
}

export default BrewPlusFormulae;
