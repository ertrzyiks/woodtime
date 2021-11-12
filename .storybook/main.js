module.exports = {
  core: {
    builder: 'webpack5',
  },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    config.devtool = 'eval-cheap-module-source-map'

    config.cache = {
      type: 'filesystem'
    }

    config.module.rules.push({
      test: /schema\.graphql$/,
      exclude: [/node_modules/],
      use: [
        {
          loader: 'raw-loader',
          options: {
            esModule: false
          }
        }
      ]
    })

    // Return the altered config
    return config;
  },
  "stories": [
    "../apps/**/*.stories.mdx",
    "../apps/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  typescript: {
    reactDocgen: false
  }
}
