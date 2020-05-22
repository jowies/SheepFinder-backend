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

const round = (p) => p.map((point) => ({
  ...point,
  Northing: Math.round(point.Northing),
  Easting: Math.round(point.Easting),
}));

const postPath = async (coordinates, height, start) => {
  const utm = geoToCoord(coordinates);
  currentPath.calculated = false;
  console.log('Incomming request');
  const coveragePath = await axios.post('http://localhost:5000', {
    path: round(utm),
    width: Math.round(getFov(height).visual.horizontal),
  }).then((res) => res.data).catch((err) => console.log(err));
  const latlng = toLongitudeLatitude(coordToGeo(coveragePath.path));
  const withStart = [start, ...latlng, start];
  console.log(withStart);
  const calculatedPath = await allCoordinatesFromPath({
    path: withStart, precision: 20, maxiumumHeightDifference: 10, height, start,
  });
  currentPath.calculated = true;
  currentPath.path = calculatedPath;
};

router.post('/path', async (ctx) => {
  const {
    coordinates, width, height, start,
  } = ctx.request.body;
  postPath(coordinates, height || width, start);
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

app.listen(3030);
