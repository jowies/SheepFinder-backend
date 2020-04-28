import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { geoToCoord } from './utm';
import allCoordinatesFromPath from './path';


const app = new Koa();
app.use(bodyParser());
const router = new Router();

const currentPath = {

};

const postPath = async (ctx) => {
  const { coordinates, width } = ctx.request.body;
  const utm = geoToCoord(coordinates);
  currentPath.calculated = false;
  // Request
  // const coveragePath = await python(utm, width);
  const calculatedPath = await allCoordinatesFromPath({ path: coordinates, precision: 20, maxiumumHeightDifference: 10 });
  currentPath.calculated = true;
  currentPath.path = calculatedPath;
};

router.post('/path', async (ctx) => {
  postPath();
  ctx.body = {
    message: 'success',
  };
  ctx.status = 201;
});

router.get('/path', async (ctx) => {
  if (currentPath.calculated) {
    ctx.body = {
      path: currentPath.path,
    };
  } else {
    ctx.body = {
      message: 'Path not loaded',
    };
  }
});

app.use(router.routes(), router.allowedMethods());

app.listen(3000);
