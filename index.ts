import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BrewPlusFormulaeTable } from './src/db';

const cronHandler = async (event: APIGatewayProxyEvent, context: Context) => {
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
    console.log(err);
    return {
      statusCode: err.statusCode,
      body: err.code,
    };
  }
};

export { cronHandler as default };
