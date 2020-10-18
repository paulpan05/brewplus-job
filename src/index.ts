import * as express from 'express';
import { urlencoded, json } from 'body-parser';

const app = express();
app.use(urlencoded({ extended: true }));
app.use(json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  return next();
});

app.get('/', (req, res) => {
  return res.send('Hello World!');
});

export default app;
