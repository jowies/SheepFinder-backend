import {
  getPreciseDistance, computeDestinationPoint, getGreatCircleBearing,
} from 'geolib';
import { lngLatToAltitude, lnglatToAltitudeBetweenPoints } from './altitude';
import { getLatLngFormat } from './utm';


const calculateIntermediatePoints = ({
  distance, precision, initialBearing, startCoordinate,
}) => {
  const points = [];
  points.push(computeDestinationPoint(startCoordinate, precision, initialBearing));
  for (let step = precision * 2; step < distance; step += precision) {
    points.push(computeDestinationPoint(startCoordinate, step, initialBearing));
  }
  return points;
};

const intermediatePointsFromCoordinates = ({ coordinates, precision = 20 }) => {
  const [coordinate1, coordinate2] = coordinates;
  const distance = getPreciseDistance(coordinate1, coordinate2);
  const initialBearing = getGreatCircleBearing(coordinate1, coordinate2);
  return calculateIntermediatePoints({
    distance, precision, initialBearing, startCoordinate: coordinate1,
  });
};

const altitudesFromPoints = async (points) => {
  const altitudes = await Promise.all(await points.map(async (point) => lngLatToAltitude(point.latitude, point.longitude)));
  const pointsWithAltitude = altitudes.map((altitude, index) => ({ ...{ altitude }, ...points[index] }));
  return pointsWithAltitude;
};

const removeUnnecessaryPoints = ({ coordinates, maximumHeightDifference }) => {
  const necessaryCoordinates = [coordinates[0]];
  for (let index = 1; index < coordinates.length - 1; index += 1) {
    const element = coordinates[index];
    if (Math.abs(element.altitude - necessaryCoordinates[necessaryCoordinates.length - 1].altitude) > maximumHeightDifference) {
      necessaryCoordinates.push(element);
    }
  }
  necessaryCoordinates.push(coordinates[coordinates.length - 1]);
  return necessaryCoordinates;
};

const coordinatesBetweenPoints = async ({ coordinates, precision, maximumHeightDifference }) => {
  const [coordinate1, coordinate2] = coordinates;
  const intermediatePoints = intermediatePointsFromCoordinates({ coordinates, precision });
  const allPoints = [...[coordinate1], ...intermediatePoints, ...[coordinate2]];
  const allPointsWithAltitude = await altitudesFromPoints(allPoints);
  const necessaryCoordinates = removeUnnecessaryPoints({
    coordinates: allPointsWithAltitude,
    maximumHeightDifference,
  });
  return necessaryCoordinates;
};


const preferedAltitude = (coordinate, height, minimumClearence) => {
  if (height + coordinate.dtm > coordinate.dom + minimumClearence) return coordinate.dtm + height;
  return coordinate.dom + minimumClearence;
};

const formatDomAndDtm = (coordinates) => {
  const { dtm, dom } = coordinates;
  const formatted = dtm[0].map((dtmElement, index) => {
    const asLngLng = getLatLngFormat({
      Easting: dtmElement[0],
      Northing: dtmElement[1],
      zoneNumber: 33,
      zoneLetter: 'V',
    });
    const format = {
      longitude: asLngLng.lng, latitude: asLngLng.lat, dtm: dtmElement[2], dom: dom[0][index][2], meters: dom[0][index][3], Northing: dtmElement[1], Easting: dtmElement[0],
    };
    console.log(format.dom);
    return format;
  });
  return formatted;
};

const removeUnnecessaryPoints2 = ({
  coordinates, maximumHeightDifference, height, minimumClearence,
}) => {
  const necessaryCoordinatesLeft = [];
  necessaryCoordinatesLeft[0] = { ...coordinates[0], altitude: preferedAltitude(coordinates[0], height, minimumClearence) };
  for (let index = 1; index < coordinates.length - 1; index += 1) {
    const element = coordinates[index];
    const prefAlt = preferedAltitude(element, height, minimumClearence);
    console.log();
    if (Math.abs(prefAlt - necessaryCoordinatesLeft[necessaryCoordinatesLeft.length - 1].altitude) > maximumHeightDifference || prefAlt - necessaryCoordinatesLeft[necessaryCoordinatesLeft.length - 1].altitude < -maximumHeightDifference * 2) {
      necessaryCoordinatesLeft.push({ ...element, altitude: prefAlt });
    }
  }
  necessaryCoordinatesLeft.push({ ...coordinates[coordinates.length - 1], altitude: preferedAltitude(coordinates[coordinates.length - 1], height, minimumClearence) });

  return necessaryCoordinatesLeft;
};

const coordinatesAndAltitudeBetweenPoints = async ({
  coordinates, maximumHeightDifference, minimumClearence, height,
}) => {
  const [coordinate1, coordinate2] = coordinates;
  const allPoints = await lnglatToAltitudeBetweenPoints(coordinate1, coordinate2);
  const formatted = formatDomAndDtm(allPoints);
  const necessaryCoordinates = removeUnnecessaryPoints2({
    coordinates: formatted,
    maximumHeightDifference,
    minimumClearence,
    height,
  });
  return necessaryCoordinates;
};

const test = async () => {
  const point1 = { longitude: 10.988444685229664, latitude: 62.406867964261586 };
  const point2 = { longitude: 10.989672004948714, latitude: 62.405606891565995 };
  const points = await coordinatesAndAltitudeBetweenPoints({
    coordinates: [point1, point2], maximumHeightDifference: 5, height: 20, minimumClearence: 5,
  });
  console.log(points);
};


test();
const allCoordinatesFromPath = async ({
  path, maximumHeightDifference = 5, height,
}) => {
  let pathWithAltitudes = [];
  const promises = [];
  const withoutClosePoints = [path[0]];
  for (let index = 1; index < path.length; index += 1) {
    if (getPreciseDistance(withoutClosePoints[withoutClosePoints.length - 1], path[index]) > 1) {
      withoutClosePoints.push(path[index]);
    }
  }
  for (let index = 0; index < withoutClosePoints.length - 1; index += 1) {
    promises[index] = coordinatesAndAltitudeBetweenPoints({
      coordinates: [withoutClosePoints[index],
        withoutClosePoints[index + 1]],
      maximumHeightDifference,
      height,
      minimumClearence: 5,
      minimumDistance: 10,
    });
  }
  const coordinates = await Promise.all(promises);
  for (let index = 0; index < withoutClosePoints.length - 1; index += 1) {
    if (index === 0) {
      pathWithAltitudes = pathWithAltitudes.concat(coordinates[index]);
    } else {
      const splicable = [...coordinates[index]];
      splicable.splice(0, 1);
      pathWithAltitudes = pathWithAltitudes.concat(splicable);
    }
  }


  const homeAltitude = pathWithAltitudes[0].altitude;
  return pathWithAltitudes.map((point) => ({
    ...point,
    altitude: Math.round(point.altitude - homeAltitude + height),
  }));
};

export default allCoordinatesFromPath;
