import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import axios from 'axios';
import { geoToCoord, coordToGeo } from './utm';
import allCoordinatesFromPath from './path';
import getFov from './fov';

const app = new Koa();
app.use(bodyParser());
const router = new Router();

const currentPath = {

};

const nicePrintForTest = (result) => {
  result.map((res) => console.log(`[${res.lat},${res.lng}]`));
};

const toLongitudeLatitude = (geo) => geo.map((g) => ({ latitude: g.lat, longitude: g.lng }));

const postPath = async (coordinates, height) => {
  const utm = geoToCoord(coordinates);
  currentPath.calculated = false;
  // Request
  const coveragePath = await axios.post('http://localhost:5000', {
    path: utm,
    width: getFov(height).visual.horizontal,
  }).then((res) => res.data).catch((err) => console.log(err));
  const latlng = toLongitudeLatitude(coordToGeo(coveragePath.path));
  const calculatedPath = await allCoordinatesFromPath({ path: latlng, precision: 20, maxiumumHeightDifference: 10 });
  currentPath.calculated = true;
  currentPath.path = calculatedPath;
};

router.post('/path', async (ctx) => {
  const { coordinates, width, height } = ctx.request.body;
  postPath(coordinates, height || width);
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

app.listen(3020);
