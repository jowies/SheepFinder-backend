import {
  getPreciseDistance, computeDestinationPoint, getGreatCircleBearing,
} from 'geolib';
import lngLatToAltitude from './altitude';


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

const removeUnnecessaryPoints = ({ coordinates, maxiumumHeightDifference }) => {
  const necessaryCoordinates = [coordinates[0]];
  for (let index = 1; index < coordinates.length - 1; index += 1) {
    const element = coordinates[index];
    if (Math.abs(element.altitude - necessaryCoordinates[necessaryCoordinates.length - 1].altitude) > maxiumumHeightDifference) {
      necessaryCoordinates.push(element);
    }
  }
  necessaryCoordinates.push(coordinates[coordinates.length - 1]);
  return necessaryCoordinates;
};

const coordinatesBetweenPoints = async ({ coordinates, precision, maxiumumHeightDifference }) => {
  const [coordinate1, coordinate2] = coordinates;
  const intermediatePoints = intermediatePointsFromCoordinates({ coordinates, precision });
  const allPoints = [...[coordinate1], ...intermediatePoints, ...[coordinate2]];
  const allPointsWithAltitude = await altitudesFromPoints(allPoints);

  const necessaryCoordinates = removeUnnecessaryPoints({
    coordinates: allPointsWithAltitude,
    maxiumumHeightDifference,
  });
  return necessaryCoordinates;
};

const allCoordinatesFromPath = async ({ path, precision = 20, maxiumumHeightDifference = 10 }) => {
  let pathWithAltitudes = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    const coordinates = await coordinatesBetweenPoints({ coordinates: [path[index], path[index + 1]], precision, maxiumumHeightDifference });
    if (index === 0) {
      pathWithAltitudes = pathWithAltitudes.concat(coordinates);
    } else {
      coordinates.splice(0, 1);
      pathWithAltitudes = pathWithAltitudes.concat(coordinates);
    }
  }
  return pathWithAltitudes;
};

export default allCoordinatesFromPath;
