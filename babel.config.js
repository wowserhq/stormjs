module.exports = {
  env: {
    cjs: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '10',
              browsers: [
                'last 2 versions',
                'not ie 1-11',
                'not ie_mob > 0',
                'not android > 0'
              ],
            },
          },
        ],
      ],
    },

    esm: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '10',
              browsers: [
                'last 2 versions',
                'not ie 1-11',
                'not ie_mob > 0',
                'not android > 0'
              ],
            },
            modules: false,
          },
        ],
      ],
    },

    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '10',
            },
          },
        ],
      ],
    },
  },
};
