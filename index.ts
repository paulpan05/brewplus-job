import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { BrewPlusFormulaeTable } from './src/db';
import app from './src';

const cronHandler = async () => {
  try {
    await BrewPlusFormulaeTable.handleCron(
      'BrewPlusFormulae',
      'name',
      'https://formulae.brew.sh/api/formula.json',
      'full_name-index',
    );
    await BrewPlusFormulaeTable.handleCron(
      'BrewPlusCaskFormulae',
      'token',
      'https://formulae.brew.sh/api/cask.json',
    );
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

const apiHandler = (event: APIGatewayProxyEvent, context: Context) => {
  proxy(createServer(app), event, context);
};

export { cronHandler as default, apiHandler as api };
