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

    return config;
  },
};
