import axios from 'axios';
import { getUTMFormat } from './utm';

const lnglatToAltitude = async (latitude, longitude) => {
  const pos = getUTMFormat({ latitude, longitude, zoneNumber: 33 });
  const res = await axios.get(`https://hoydedata.no/arcgis/rest/services/dtm1_33/ImageServer/identify?f=json&geometryType=esriGeometryPoint&geometry={%22x%22:${pos.Easting},%22y%22:${pos.Northing},%22spatialReference%22:{%22wkid%22:25833,%22latestWkid%22:25833}}`)
    .then((response) => response.data.value).catch((err) => console.log(err));
  return res;
};


export default lnglatToAltitude;
