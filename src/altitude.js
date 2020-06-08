import axios from 'axios';
import { getUTMFormat } from './utm';

export const lngLatToAltitude = async (latitude, longitude) => {
  const pos = getUTMFormat({ latitude, longitude, zoneNumber: 33 });
  const res = await axios.get(`https://hoydedata.no/arcgis/rest/services/dtm1_33/ImageServer/identify?f=json&geometryType=esriGeometryPoint&geometry={%22x%22:${pos.Easting},%22y%22:${pos.Northing},%22spatialReference%22:{%22wkid%22:25833,%22latestWkid%22:25833}}`)
    .then((response) => response.data.value).catch((err) => console.log(err));
  return res;
};

export const lnglatToAltitudeBetweenPoints = async (coord1, coord2) => {
  const pos1 = getUTMFormat({ longitude: coord1.longitude, latitude: coord1.latitude, zoneNumber: 33 });
  const pos2 = getUTMFormat({ longitude: coord2.longitude, latitude: coord2.latitude, zoneNumber: 33 });

  const both = await Promise.all([
    axios.get(`https://hoydedata.no/arcgis/rest/services/Terrengprofil/GPServer/Terrengprofil/execute?f=json&env%3AoutSR=25833&InputLineFeatures=%7B%22fields%22%3A%5B%7B%22name%22%3A%22OID%22%2C%22type%22%3A%22esriFieldTypeObjectID%22%2C%22alias%22%3A%22OID%22%7D%5D%2C%22geometryType%22%3A%22esriGeometryPolyline%22%2C%22features%22%3A%5B%7B%22geometry%22%3A%7B%22paths%22%3A%5B%5B%5B${pos1.Easting}%2C${pos1.Northing}%5D%2C%5B${pos2.Easting}%2C${pos2.Northing}%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A25833%2C%22latestWkid%22%3A25833%7D%7D%2C%22attributes%22%3A%7B%22OID%22%3A1%7D%7D%5D%2C%22sr%22%3A%7B%22wkid%22%3A25833%2C%22latestWkid%22%3A25833%7D%7D&ProfileIDField=OID&DEMResolution=FINEST&MaximumSampleDistance=78204.56092215818&MaximumSampleDistanceUnits=Meters&returnZ=true&returnM=true&ElevationType=dtm`).then((response) => response.data).catch((err) => console.log(err)),
    axios.get(`https://hoydedata.no/arcgis/rest/services/Terrengprofil/GPServer/Terrengprofil/execute?f=json&env%3AoutSR=25833&InputLineFeatures=%7B%22fields%22%3A%5B%7B%22name%22%3A%22OID%22%2C%22type%22%3A%22esriFieldTypeObjectID%22%2C%22alias%22%3A%22OID%22%7D%5D%2C%22geometryType%22%3A%22esriGeometryPolyline%22%2C%22features%22%3A%5B%7B%22geometry%22%3A%7B%22paths%22%3A%5B%5B%5B${pos1.Easting}%2C${pos1.Northing}%5D%2C%5B${pos2.Easting}%2C${pos2.Northing}%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A25833%2C%22latestWkid%22%3A25833%7D%7D%2C%22attributes%22%3A%7B%22OID%22%3A1%7D%7D%5D%2C%22sr%22%3A%7B%22wkid%22%3A25833%2C%22latestWkid%22%3A25833%7D%7D&ProfileIDField=OID&DEMResolution=FINEST&MaximumSampleDistance=78204.56092215818&MaximumSampleDistanceUnits=Meters&returnZ=true&returnM=true&ElevationType=dom`).then((response) => response.data).catch((err) => console.log(err))]);
  return { dtm: both[0].results[0].value.features[0].geometry.paths, dom: both[1].results[0].value.features[0].geometry.paths };
};
