const path = require("path");

module.exports = {
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: [
    "../**/*.stories.mdx",
    "../**/*.stories.@(js|jsx|ts|tsx)",
  ],
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

    return config;
  },
};
