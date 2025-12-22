import LoadingIndicator from './LoadingIndicator';

export default {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
};

export const Active = () => <LoadingIndicator active={true} />;
