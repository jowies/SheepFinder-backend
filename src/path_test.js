import allCoordinatesFromPath from './path';

const path = [{
  latitude: 62.56358,
  longitude: 10.02855,
}, {
  latitude: 62.56189,
  longitude: 10.02061,
}, {
  latitude: 62.55567,
  longitude: 10.03116,
},
{
  latitude: 62.55679,
  longitude: 10.02922,
}, {
  latitude: 62.55599,
  longitude: 10.0166,
},
];


const test = async () => {
  const calculatedPath = await allCoordinatesFromPath({ path, precision: 20, maxiumumHeightDifference: 10 });
  console.log(calculatedPath);
};


test();
