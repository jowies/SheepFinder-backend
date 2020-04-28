module.exports = function babel(api) {
  const presets = [
    [
      '@babel/env',
      {
        targets: {
          node: 'current',
        },
        corejs: '2',
        useBuiltIns: 'usage',
      },
    ],
  ];
  const plugins = [
    ['module-resolver', {
      root: ['./src'],
    }],
  ];

  api.cache(true);
  return {
    presets,
    plugins,
  };
};
