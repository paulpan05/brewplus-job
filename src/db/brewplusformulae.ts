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
      throw Object.assign(new Error(), { statusCode: res.status, code: res.statusText });
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
      result.forEach(async (item) => {
        if (!names.has(item[primaryKey])) {
          const deleteParams = {
            TableName: tableName,
            Key: {
              [primaryKey]: item[primaryKey],
            },
          };
          await this.dynamodb.delete(deleteParams).promise();
        }
      });
    }

    for (let i = 0; i < items.length; i += 25) {
      const writeParams = {
        RequestItems: {
          [tableName]: items.slice(i, i + 25),
        },
      };
      await this.dynamodb.batchWrite(writeParams).promise();
    }

    return undefined;
  }
}

export default BrewPlusFormulae;
