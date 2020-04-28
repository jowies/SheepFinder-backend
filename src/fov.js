const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

const fov = (angleOfView, height) => 2 * Math.tan(degreesToRadians(angleOfView) / 2) * height;

const aov = {
  // Thermal
  thermal: {
    horizontal: '57',
    vertical: '44.31',
  },
  // Visual
  visual: {
    horizontal: '74.74',
    vertical: '51.72',
  },
};

const getFov = (height) => ({
  thermal: {
    horizontal: fov(aov.thermal.horizontal, height),
    vertical: fov(aov.thermal.vertical, height),
  },
  visual: {
    horizontal: fov(aov.visual.horizontal, height),
    vertical: fov(aov.visual.vertical, height),
  },
});

console.log(getFov(100));
