import Converter from 'utm-latlng';


const utm = new Converter('EUREF89');

export const getUTMFormat = ({
  latitude, longitude, zoneNumber,
}) => utm.convertLatLngToUtm(latitude, longitude, 10, zoneNumber);

export const getLatLngFormat = ({
  Northing, Easting, zoneNumber, zoneLetter,
}) => utm.convertUtmToLatLng(Easting, Northing, zoneNumber, zoneLetter);


export const geoToCoord = (coordinates) => {
  const asUTM = coordinates.map((coordinate) => getUTMFormat({ ...coordinate, zoneNumber: 32 }));
  return asUTM;
};

export const coordToGeo = (geos) => {
  const asLatLng = geos.map((geo) => getLatLngFormat({ ...geo, zoneNumber: 32, zoneLetter: 'V' }));
  return asLatLng;
};
