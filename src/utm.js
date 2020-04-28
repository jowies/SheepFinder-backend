import Converter from 'utm-latlng';


const utm = new Converter('EUREF89');

export const getUTMFormat = ({
  latitude, longitude, zoneNumber,
}) => utm.convertLatLngToUtm(latitude, longitude, 10, zoneNumber);

export const getLngLatFormat = ({
  northing, easting, zoneNumber, zoneLetter,
}) => utm.convertUtmToLatLng(easting, northing, zoneNumber, zoneLetter);


export const geoToCoord = (coordinates) => {
  const asUTM = coordinates.map((coordinate) => getUTMFormat({ ...coordinate, zoneNumber: 32 }));
  return asUTM;
};
