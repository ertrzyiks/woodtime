import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import Scanner, { Props } from '../src/Scanner';

export default {
  title: 'Woodtime/Scanner',
  component: Scanner,
  argTypes: { onRead: { action: 'read' } }
} as Meta;

const Template: Story<Props> = (args) => <Scanner {...args} />;

export const Default = Template.bind({});
Default.args = {
};
