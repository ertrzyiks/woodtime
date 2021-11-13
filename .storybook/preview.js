import '@storybook/addon-console'
import { configureActions } from '@storybook/addon-actions';

configureActions({
  clearOnStoryChange: true,
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
