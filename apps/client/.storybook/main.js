const path = require('path');

module.exports = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../public'],
  addons: [],
  typescript: {
    reactDocgen: false,
  },
  viteFinal: async (config, { configType }) => {
    config.root = path.resolve(__dirname);

    // Handle GraphQL schema files
    config.define = config.define || {};

    // Ensure .graphql files are treated as assets for ?raw imports
    config.assetsInclude = config.assetsInclude || [];
    if (!Array.isArray(config.assetsInclude)) {
      config.assetsInclude = [config.assetsInclude];
    }
    config.assetsInclude.push(/\.graphql$/);

    // Remove the copy-index-to-404 plugin for Storybook builds
    // This plugin is only needed for the main app deployment
    config.plugins = config.plugins.filter(
      plugin => plugin && plugin.name !== 'copy-index-to-404'
    );

    return config;
  },
};
