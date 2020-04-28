const randomLongitude = () => 61.0 + Math.random();

const randomLatitude = () => 10.0 + Math.random();

const generatePositions = (amount) => {
  const pos = [];
  for (let i = 0; i < amount; i += 1) {
    pos.push({ longitude: randomLongitude(), latitude: randomLatitude() });
  }
  return pos;
};

export { generatePositions };
